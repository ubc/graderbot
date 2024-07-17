let fileContent = '';

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fileContent = e.target.result;
            document.getElementById('confirmButton').disabled = false;
        };
        reader.readAsText(file);
    }
});

document.getElementById('confirmButton').addEventListener('click', function() {
    if (fileContent) {
        displayCSV(fileContent);
    }
});

function displayCSV(data) {
    const rows = data.split('\n');
    const table = document.createElement('table');
    
    rows.forEach(row => {
        const tr = document.createElement('tr');
        const cells = row.split(',');
        cells.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''; // Clear previous content
    outputDiv.appendChild(table);
}
