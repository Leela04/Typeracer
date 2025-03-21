from flask import Flask, render_template,request,redirect,url_for,session,jsonify
import mysql.connector

app=Flask (__name__)
app.secret_key = "your_secret_key"

#data connection
db=mysql.connector.connect(
    host="localhost",
    user="root",
    password="2004",
    database="typeracer"
)

cursor=db.cursor()

def create_tables():
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            is_admin BOOLEAN NOT NULL DEFAULT FALSE
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS results (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            accuracy DECIMAL(5,2),
            wpm INT,
            time_taken DECIMAL(5,2),
            FOREIGN KEY (user_id) REFERENCES student(id)
        )
    """)
    db.commit()

create_tables()


# Check if the connection is successful
if db.is_connected():
    print("Connected to the database")
else:
    print("Failed to connect to the database")

# Admin credentials (Hardcoded)
ADMIN_NAME = "Leela"
ADMIN_EMAIL = "leelavathiselladurai04@gmail.com"
ADMIN_PASSWORD = "2004"

# Login Page (GET Request)
@app.route('/')
def login_page():
    return render_template('login.html')

# Handle Login (POST Request)
@app.route('/login', methods=['POST'])
def login():
    name = request.form['name']
    email=request.form['email']
    


    # Check if user is admin (hardcoded)
    if name == ADMIN_NAME and email == ADMIN_EMAIL:

        session['name'] = name
        session['email'] = email
        return render_template('admin_password.html')


        #    # Store admin details in session
        #session['user_id'] = 0  # Set a placeholder ID
        #session['name'] = ADMIN_NAME
        #session['email'] = ADMIN_EMAIL
        #session['is_admin'] = True

  

       # return redirect(url_for('result_page'))  # Admin sees result
    #else:
     #   return "Invalid admin credentials", 401



    #if not admin,check for students in database
    cursor.execute("select id,name,email,is_admin from student where email =%s",(email,))
    user=cursor.fetchone()

    if user:
        #store student details in session(for students)
        session['user_id']=user[0]
        session['name']=user[1] #store name
        session['email']=user[2] #store mail
        session['is_admin']=user[3]

        
        # Student Login Successful
        return redirect(url_for('game_page'))#non admin student
        

    
    # if student doesn't exist ,create a new student
    #name = request.form['name']
    try:

        cursor.execute("insert into student(name,email,is_admin) values (%s, %s, %s)",(name,email,False))
        db.commit()

        # Store new student in session
        session['user_id'] = cursor.lastrowid
        session['name'] = name
        session['email'] = email
        session['is_admin'] = False
        return redirect(url_for('game_page'))
    
    except mysql.connector.Error as e:
        db.rollback()
        print(f"Error: {e}")
        return "Error during registration. Please try again.", 500


@app.route('/admin_password', methods=['POST'])
def admin_password():
    password = request.form['password']

    # Verify the admin password
    if password == ADMIN_PASSWORD:
        session['is_admin'] = True
        return redirect(url_for('admin_result'))  # Admin result page
    else:
        return "Invalid Admin Password", 401

# Student Game Page
@app.route('/game')
def game_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('game.html', name=session['name'])


# Handle Typing Test Result Submission
@app.route('/submit_result', methods=['POST'])
def submit_result():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    if request.is_json:
        # Extract the data from the request

        data = request.json
        accuracy = data.get('accuracy')
        wpm = data.get('wpm')
        time_taken = data.get('timeTaken')
        score = data.get("score")


        # Check if the values are being received properly
        print(f"Received data: Accuracy={accuracy}, WPM={wpm}, Time Taken={time_taken} , score ={score}")

        # Store the data in the database
        cursor = db.cursor() 

        try:
            cursor.execute("INSERT INTO results (user_id, name, email, accuracy, wpm, time_taken,score) VALUES (%s, %s,%s, %s, %s,%s, %s)",
                   (session['user_id'], session['name'], session['email'], accuracy, wpm, time_taken,score),)
            db.commit()

                # Recalculate ranks
            update_ranks()


            return jsonify({"status": "success","message": "Result saved successfully"})
        except Exception as e:
            db.rollback()
            print(f"Error while inserting into DB: {e}")
            return jsonify({"status": "error", "message": "Failed to submit result!"})

    else:
        return jsonify({"status": "error", "message": "Invalid JSON data"})

# Function to update ranks
def update_ranks():
    cursor = db.cursor(dictionary=True)

    # Select all records ordered by score (highest first)
    cursor.execute("SELECT id, FROM results ORDER BY score DESC")
    results = cursor.fetchall()

    # Check if there are any results returned
    if not results:
        print("No results found.")
        return


    # Assign ranks based on position
    #for rank, result in enumerate(results, start=1):
     #   print(f"Updating rank {rank} for ID {result['id']} with score {result['score']}")

      #  cursor.execute("UPDATE results SET rank = %s WHERE id = %s", (rank, result['id']))
    # Update ranks based on the score
    rank = 1
    for result in results:
        cursor.execute("UPDATE results SET rank = %s WHERE id = %s", (rank, result['id']))
        rank += 1

    db.commit()
    return jsonify(({"message": "Result submitted and rank updated successfully"}), 200)

    
    

@app.route('/show_result')
def show_result():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))

    accuracy = request.args.get('accuracy')
    wpm = request.args.get('wpm')
    return render_template('show_result.html', accuracy=accuracy, wpm=wpm ,  enumerate=enumerate)


# Admin Result Page
@app.route('/admin_result')
def admin_result():
    if 'user_id' not in session or not session.get('is_admin'):
        return redirect(url_for('login_page'))
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM results ORDER BY `rank` ASC")
    results = cursor.fetchall()

    # Debug: print results to console to verify they're fetched correctly
    print(results)

    return render_template("admin_result.html", results=results, enumerate = enumerate)


if __name__ == '__main__':
    app.run(debug =True , host = '0.0.0.0' , port=5000)
    



    
