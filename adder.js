let total = 0;

// Function to continuously add
function addContinuously() {
  let increment = 1; // You can change this to any number you want to add each time
  total += increment;
  console.log(`Total: ${total}`);
}

// Run the function every second
setInterval(addContinuously, 1000);
