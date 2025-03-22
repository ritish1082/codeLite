const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'material-darker',
    indentUnit: 4,
    smartIndent: true,
    autofocus: true,
    autoCloseBrackets: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers"],
    lint: true,
    hintOptions: {
        hint: CodeMirror.hint.javascript,
        completeSingle: false,
    },
    extraKeys: {
        "Ctrl-Space": "autocomplete", // Enable autocomplete with Ctrl+Space
    },
});

// Override console.log to capture output
const originalConsoleLog = console.log;
let capturedOutput = "";

console.log = function (...args) {
    capturedOutput += args.join(" ") + "\n"; // Capture the output
    originalConsoleLog.apply(console, args); // Preserve original console.log behavior
};

// Initialize Pyodide
let pyodide;
async function initializePyodide() {
    pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.21.3/full/",
    });
    console.log("Pyodide initialized successfully!");
}

// Run the code when the button is clicked
async function run() {
    const code = editor.getValue(); // Get the code from the editor
    const language = document.getElementById("language-select").value; // Get the selected language
    const outputElement = document.getElementById("output");

    outputElement.innerText = "Running..."; // Show that the code is running
    capturedOutput = ""; // Reset captured output

    try {
        if (language === "javascript") {
            // Evaluate JavaScript code
            let result = eval(code);

            // Display the result in the output area
            if (result !== undefined) {
                outputElement.innerText = result;
            } else if (capturedOutput) {
                outputElement.innerText = capturedOutput; // Display captured console.log output
            } else {
                outputElement.innerText = "Code executed successfully (no output).";
            }
        } else if (language === "python") {
            // Ensure Pyodide is initialized
            if (!pyodide) {
                await initializePyodide();
            }

            // Execute Python code
            let result = await pyodide.runPythonAsync(code);

            // Display the result in the output area
            if (result !== undefined) {
                outputElement.innerText = result;
            } else if (capturedOutput) {
                outputElement.innerText = capturedOutput; // Display captured console.log output
            } else {
                outputElement.innerText = "Code executed successfully (no output).";
            }
        }
    } catch (e) {
        // If an error occurs, show the error message in the output area
        outputElement.innerText = "Error: " + e.message;
    }
}

// Change CodeMirror mode based on selected language
document.getElementById("language-select").addEventListener("change", (e) => {
    const language = e.target.value;
    editor.setOption("mode", language);
});

// Change CodeMirror theme based on selected theme
document.getElementById("theme-select").addEventListener("change", (e) => {
    const theme = e.target.value;
    editor.setOption("theme", theme);
});

// Initialize Split.js for draggable divider
Split(['.editor-panel', '.output-panel'], {
    sizes: [50, 50],
    minSize: 200,
    gutterSize: 10,
});

// Initialize Pyodide on page load
initializePyodide();