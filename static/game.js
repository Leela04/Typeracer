 // Selecting required HTML elements
let timerElement = document.getElementById("timer"); // Timer display
let quoteInput = document.getElementById("quoteInput"); // User input field
let startButton = document.getElementById("start-test"); // Start button
let stopButton = document.getElementById("stop-test"); // Stop button
let nextButton = document.getElementById("next-test");  // Ensure you have a Next button in HTML

let accuracyElement = document.getElementById("acc"); // Accuracy display
let wpmElement = document.getElementById("wpm"); // Words per minute display
let resultContainer = document.querySelector(".result"); // Result container
let passageTextElement = document.getElementById("passageTextElement"); // Passage display

// Define the passage text directly in JavaScript
let passageText = ["the first","Artificial Intelligence (AI) is a rapidly evolving field of computer science focused on creating systems capable of performing tasks that usually require human intelligence. These tasks include problem-solving, decision-making, speech recognition, language translation, and image processing. AI technology is transforming industries and reshaping how we interact with machines." ,
                    "AI is broadly classified into two types: Narrow AI and General AI. Narrow AI, also called Weak AI, is designed to perform specific tasks like virtual assistants (e.g., Siri, Alexa), facial recognition, and search engines. In contrast, General AI aims to replicate human cognitive abilities, enabling machines to perform any intellectual task a human can do. While Narrow AI is already part of our daily lives, General AI remains in the research phase." ,
                    "Machine Learning (ML) is a critical subset of AI, where machines learn from data to improve their performance without being explicitly programmed. Deep Learning, a branch of ML, uses neural networks inspired by the human brain to process complex information. These technologies power advanced applications like self-driving cars, medical diagnosis, and personalized recommendations." ,
                    "AI is revolutionizing multiple sectors. In healthcare, AI helps in disease detection, drug discovery, and patient care. Finance uses AI for fraud detection and automated trading. In education, AI enhances learning experiences through personalized content and intelligent tutoring systems. Transportation benefits from AI through autonomous vehicles and traffic management systems.",
                    "Despite its advantages, AI poses ethical and societal concerns. Issues like job displacement, data privacy, and algorithmic bias require careful consideration. As AI systems become more autonomous, addressing their impact on human rights and safety becomes crucial.",
                    "The future of AI promises even more groundbreaking advancements. From smart cities to AI-driven scientific discoveries, the potential is vast. However, responsible AI development is essential to ensure it benefits humanity while minimizing risks." ,
                    "In conclusion, AI technology is transforming the world, enhancing efficiency, and opening new possibilities. With continuous innovation and ethical oversight, AI has the potential to shape a better future for all."
                 ];

let currentPassageIndex = 0; // Track which passage is active
let totalPassages = passageText.length; // Total number of passages


let startTime, interval, testRunning = false , timeLeft = 600;

// Display the first passage
function loadPassage() {
    passageTextElement.innerText = passageText[currentPassageIndex];
    
        // Refresh the textarea for the next passage
    quoteInput.value = "";  // Clear the textarea
    quoteInput.removeAttribute ('disabled');  // Enable the textarea
    setTimeout(() => quoteInput.focus(),0);  // Focus the input field for the user to start typing
    
    
    // Hide/show buttons based on the passage index
    if (currentPassageIndex === totalPassages - 1) {
        // Last passage: Show Submit button, hide Next button
        nextButton.style.display = "none";
        stopButton.style.display = "inline-block";  // Show Submit button
    } else {
        // Any other passage: Show Next button, hide Submit button
        nextButton.style.display = "inline-block";
        stopButton.style.display = "none";
    }

    // Refresh the textarea for the next passage
    //quoteInput.value = "";  // Clear the textarea
    //quoteInput.removeAttribute ('disabled');  // Enable the textarea
    //setTimeout(() => quoteInput.focus(),0);  // Focus the input field for the user to start typing



    
}


                    

//document.getElementById("passage-text").innerText = passageText; // Set passage in HTML

// Variables to track time and test state
//let startTime, interval, testRunning = false , timeLeft = 600; // 10 min

/**
 * Function to start the typing test
 * - Resets input and timer
 * - Enables the input field
 * - Starts the timer
 */
function startTest() {
    if (testRunning) return; // Prevents restarting while already running
    testRunning = true; // Mark test as running

    // Reset UI elements
    startButton.style.display = "none"; // Hide start button
    stopButton.style.display = "inline-block"; // Show stop button
    nextButton.style.display = "inline-block"; // Hide next button initially
    quoteInput.disabled = false; // Enable input field
    quoteInput.value = ""; // Clear previous input
    quoteInput.focus(); // Focus cursor on input field
    resultContainer.style.display = "none"; // Hide previous result

    // Initialize the timer
    startTime = new Date().getTime();
    timerElement.innerText = "10:00"; // Reset timer display

    // Timer function updates every second
    interval = setInterval(() => {
        let elapsedTime = Math.floor((new Date().getTime() - startTime) / 1000);
        timeLeft--;
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerElement.innerText = `${minutes}:${seconds < 10 ? '0': ''}${seconds}`; // Update timer display

        if (timeLeft <= 0){
            clearInterval(interval);
            autosubmit();

        }
    }, 1000);
    loadPassage();
}


/**
 * Function to calculate results
 */
function calculateResults() {

    // Retrieve the user's typed text
    let typedText = quoteInput.value.trim();
    let passageChars = passageText[currentPassageIndex].split(""); // Convert passage into array of characters
    let typedChars = typedText.split(""); // Convert typed input into array of characters

    // Calculate the number of correct characters typed
    let correctChars = 0;
    for (let i = 0; i < Math.min(typedChars.length, passageChars.length); i++) {
        if (typedChars[i] === passageChars[i]) {
            correctChars++; // Count correct characters
        }
    }

    // Calculate accuracy percentage
    let accuracy = typedChars.length > 0 ? (correctChars / passageChars.length) * 100 : 0;

    // Calculate time taken in minutes correctly
    let timeTaken = (new Date().getTime() - startTime) / 60000; // Convert ms to minutes

    // Prevent division by zero when calculating WPM
    let wordCount = typedText.split(" ").filter(word => word.length > 0).length;
    let wpm = timeTaken > 0 ? Math.floor(wordCount / timeTaken) : 0;

    //Calculate score based on accuracy, WPM, and time
    accuracy = parseFloat(accuracy)  // Ensure accuracy is a float
    wpm = parseFloat(wpm)  // Ensure WPM is a float
    timeTaken = parseFloat(timeTaken)  //Ensure time_taken is a float


    let score = calculateScore(accuracy, wpm, timeTaken);

    // Display results
    accuracyElement.innerText = accuracy.toFixed(2) + "%"; // Show accuracy
    wpmElement.innerText = wpm + " WPM"; // Show words per minute
    resultContainer.style.display = "block"; // Show result container

    // Highlight errors in red
    passageTextElement.innerHTML = highlightErrors(passageText[currentPassageIndex], typedText);


    return { accuracy, wpm, timeTaken ,score};
}

// Function to calculate the score based on accuracy (50%), WPM (30%), and time (20%)
function calculateScore(accuracy, wpm, timeTaken) {
    // Normalize time: Faster completion = Higher score (we invert time to favor speed)
    let timeFactor = 100 / (timeTaken + 1); 

    // Weighted score calculation
    return (0.5 * accuracy) + (0.3 * wpm) + (0.2 * timeFactor);
}

// Function to highlight errors in red
function highlightErrors(original, typed) {
    let highlightedText = "";

    for (let i = 0; i < original.length; i++) {
        if (typed[i] === original[i]) {
            highlightedText += original[i];
        } else {
            highlightedText += `<span class="error">${original[i]}</span>`;
        }
    }

    return highlightedText;
}


/**
 * Function to stop the typing test
 * - Stops the timer
 * - Disables input field
 * - Calculates accuracy and speed
 * - Displays results
 */
function stopTest() {
    if (!testRunning) return; // Prevents stopping when not running
    testRunning = false; // Mark test as stopped

    //Stop the timer
    clearInterval(interval);
    //loadPassage(); // Load the first passage
    // Disable input field and reset buttons
    //stopButton.style.display = "none"; // Hide stop button
    //startButton.style.display = "none"; // hide start button
    quoteInput.disabled = true; // Disable input field 

    // Calculate results
    let result = calculateResults();
    console.log("Test stopped. Results:", result); // Log the results


    // Now send the result to the Flask server
    //sendResultToServer(accuracy, wpm, timeTaken);



    // If not the last passage, show "Next" button; else show "Submit"
    if (currentPassageIndex < passageText.length - 1) {
        nextButton.style.display = "inline-block"; // Show Next button
    } else {
        stopButton.style.display = "none"; // Show Submit button
        submitFinalResult();
    }

    /* Move to the next passage if available
    if (currentPassageIndex < passageText.length - 1) {
        currentPassageIndex++;
        setTimeout(() => startTest(), 3000); // Load the next passage after 3 seconds
    } else {
        alert("All passages completed!");
    }*/



}

/**
 * Move to the next passage
 */
function nextPassage() {
    if (currentPassageIndex < passageText.length - 1) {
        currentPassageIndex++;
        loadPassage();
        // Clear and reset textarea for the new passage
        //quoteInput.value = ""; // Clear the input
        //quoteInput.removeAttribute('disabled');  // Ensure it's enabled
        //setTimeout(() =>quoteInput.focus() , 0); // Focus for new input

        
    }else {
        alert("You've completed all passages!");  // Alert when all passages are completed
        submitFinalResult();  // Handle final result submission
    }

}


// Automatically submit when the time is up
function autosubmit() {
    alert("Time's up! Submitting your result.");
    stopTest();
    if (currentPassageIndex < passageText.length - 1) {
        nextPassage();
    } else {
        submitFinalResult();
    }

}

// Function to submit the final results (can be customized to save results)
function submitFinalResult() {
    const { accuracy, wpm, timeTaken ,score } = calculateResults();
    // Send the result to the server or handle it accordingly
    sendResultToServer(accuracy, wpm, timeTaken , score);  // Call function to save the results
}


/**
 * Send the test results to the Flask server
 */
function sendResultToServer(accuracy, wpm, timeTaken , score ) {
    
    
    // Log data being sent to the server
    console.log("Sending result to server:", { accuracy, wpm, timeTaken, score });

    fetch("/submit_result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accuracy, wpm, timeTaken , score})
    })
    .then(response => response.json())
    .then(data => {
        console.log("Result saved successfully:", data);
        // You can display a success message or redirect the user here
        // Redirect to the /result page with accuracy and wpm
        window.location.href = `/show_result?accuracy=${accuracy.toFixed(2)}&wpm=${wpm}&timetaken=${timeTaken}`;

    })
    .catch((error) => {
        console.error("Error saving result:", error);
    });
}

