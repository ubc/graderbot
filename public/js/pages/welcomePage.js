document.addEventListener('DOMContentLoaded', function() {
    const instructions = document.getElementById('instructions');
    const startButton = document.getElementById('startButton');
    
    const steps = [
        "1. Read the assignment instructions carefully",
        "2. Write your code in the provided editor",
        "3. Click 'Submit' to run the Grader Bot",
        "4. Review your results and make improvements"
    ];

    function typeWriter(text, element, i = 0) {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(() => typeWriter(text, element, i), 25);
        } else {
            element.innerHTML += '<br>';
            if (steps.length > 0) {
                setTimeout(() => typeWriter(steps.shift(), element), 500);
            }
        }
    }

    typeWriter(steps.shift(), instructions);

    startButton.addEventListener('click', function() {
        window.location.href = '/';  // Redirect to the main page
    });
});