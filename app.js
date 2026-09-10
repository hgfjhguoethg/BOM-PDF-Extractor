// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Global state
let globalState = {
    pdfFile: null,
    currentPage: 1,
    totalPages: 0,
    extractedData: {
        projectNumber: '',
        projectName: '',
        revision: '',
        partNumber: '',
        bomItems: []
    },
    validationReport: []
};

// DOM Elements
const uploadBox = document.getElementById('uploadBox');
const pdfInput = document.getElementById('pdfInput');
const uploadStatus = document.getElementById('uploadStatus');
const extractBtn = document.getElementById('extractBtn');
const pageSelect = document.getElementById('pageSelect');
const bomTableBody = document.getElementById('bomTableBody');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const downloadReportBtn = document.getElementById('downloadReportBtn');
const addRowBtn = document.getElementById('addRowBtn');
const deleteRowBtn = document.getElementById('deleteRowBtn');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const loadingModal = document.getElementById('loadingModal');
const loadingText = document.getElementById('loadingText');

// Initialize Event Listeners
function initializeEventListeners() {
    uploadBox.addEventListener('click', () => pdfInput.click());
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    pdfInput.addEventListener('change', handleFileSelect);
    extractBtn.addEventListener('click', extractBOMData);
    exportExcelBtn.addEventListener('click', exportToExcel);
    exportJsonBtn.addEventListener('click', exportJSON);
    downloadReportBtn.addEventListener('click', downloadReport);
    addRowBtn.addEventListener('click', addTableRow);
    deleteRowBtn.addEventListener('click', deleteSelectedRows);
    selectAllCheckbox.addEventListener('change', toggleSelectAll);
}

// File Upload Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadBox.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files } });
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
            globalState.pdfFile = file;
            showStatus(`PDF loaded: ${file.name}`, 'success');
            extractBtn.disabled = false;
            pageSelect.disabled = false;
            loadPDF(file);
        } else {
            showStatus('Please select a valid PDF file', 'error');
        }
    }
}

function showStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `status-message ${type}`;
    uploadStatus.style.display = 'block';
    setTimeout(() => {
        uploadStatus.style.display = 'none';
    }, 4000);
}

// PDF Processing
async function loadPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    globalState.totalPages = pdf.numPages;
    pageSelect.max = pdf.numPages;
    pageSelect.value = 1;
    showStatus(`PDF loaded: ${pdf.numPages} pages found`, 'info');
}

async function extractBOMData() {
    if (!globalState.pdfFile) {
        showStatus('Please upload a PDF first', 'error');
        return;
    }

    showLoading(true, 'Extracting BOM data...');
    
    try {
        const pageNum = parseInt(pageSelect.value);
        const arrayBuffer = await globalState.pdfFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(pageNum);
        
        // Get page canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: context, viewport }).promise;
        const imageData = canvas.toDataURL('image/png');
        
        // OCR Processing
        showLoading(true, 'Running OCR on page ' + pageNum + '...');
        const result = await Tesseract.recognize(imageData, 'eng', {
            logger: m => console.log('OCR Progress:', m)
        });
        
        const text = result.data.text;
        console.log('Extracted Text:', text);
        
        // Parse BOM from text
        parseBOMData(text);
        
        showLoading(false);
        showStatus('BOM data extracted successfully!', 'success');
        updateStatistics();
        generateValidationReport();
        
        // Enable export buttons
        exportExcelBtn.disabled = false;
        exportJsonBtn.disabled = false;
        downloadReportBtn.disabled = false;
        
    } catch (error) {
        console.error('Extraction error:', error);
        showStatus('Error during extraction: ' + error.message, 'error');
        showLoading(false);
    }
}

// BOM Data Parsing
function parseBOMData(text) {
    // Clear previous data
    globalState.extractedData.bomItems = [];
    bomTableBody.innerHTML = '';
    
    // Extract project information
    extractProjectInfo(text);
    
    // Parse BOM table
    const lines = text.split('\n');
    let inBOMSection = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect BOM section
        if (line.includes('ASSEMBLY') || line.includes('QTY') || line.includes('PART NUMBER')) {
            inBOMSection = true;
            continue;
        }
        
        // Skip table headers and empty lines
        if (!line || line.includes('---') || line.includes('AMT') || line.includes('SYM') || line.includes('SHT')) {
            continue;
        }
        
        // Parse BOM rows
        if (inBOMSection && line.length > 5) {
            const bomItem = parseBOMLine(line);
            if (bomItem && bomItem.partNumber) {
                globalState.extractedData.bomItems.push(bomItem);
                addBOMRowToTable(bomItem);
            }
        }
    }
}

function extractProjectInfo(text) {
    // Extract project number (usually in format like U71B)
    const projectNumberMatch = text.match(/([A-Z]\d{2,3}[A-Z]?)/);
    if (projectNumberMatch) {
        globalState.extractedData.projectNumber = projectNumberMatch[1];
        document.getElementById('projectNumber').value = projectNumberMatch[1];
    }
    
    // Extract assembly name
    const assemblyMatch = text.match(/ASSEMBLY\s+([S\d]+)/);
    if (assemblyMatch) {
        globalState.extractedData.projectName = assemblyMatch[0];
        document.getElementById('projectName').value = assemblyMatch[0];
    }
    
    // Extract revision
    const revisionMatch = text.match(/REV[A-Z]?[\s:]+([A-Z0-9])/);
    if (revisionMatch) {
        globalState.extractedData.revision = revisionMatch[1];
        document.getElementById('revision').value = revisionMatch[1];
    }
}

function parseBOMLine(line) {
    // Pattern matching for BOM rows
    // Expected format: QTY | PART# | DESCRIPTION | LENGTH | MATERIAL | PROCESS | FINISH
    
    const parts = line.split(/\s{2,}|[\t|]/);
    
    if (parts.length < 3) return null;
    
    // Filter empty parts
    const cleanParts = parts.filter(p => p && p.trim()).map(p => p.trim());
    
    // Confidence scoring
    let confidence = 0;
    let qty = '';
    let partNumber = '';
    let description = '';
    let length = '';
    let material = '';
    let process = '';
    let finish = '';
    
    // Try to extract quantity (usually first numeric value)
    if (/^\d+$/.test(cleanParts[0])) {
        qty = cleanParts[0];
        confidence += 20;
    } else if (/^\d+/.test(cleanParts[0])) {
        const match = cleanParts[0].match(/^(\d+)/);
        if (match) qty = match[1];
        confidence += 15;
    }
    
    // Extract part number (alphanumeric like S1A, S1B, etc.)
    if (cleanParts.length > 1 && /^[A-Z]\d+[A-Z]?$/.test(cleanParts[1])) {
        partNumber = cleanParts[1];
        confidence += 25;
    }
    
    // Extract description (usually longest string)
    if (cleanParts.length > 2) {
        description = cleanParts.slice(2).join(' ');
        if (description.length > 10) confidence += 20;
    }
    
    // Extract dimensions from description
    const dimensionMatch = description.match(/(\d+\.?\d*)\s*(?:X|x)\s*(\d+\.?\d*)/);
    if (dimensionMatch) {
        length = `${dimensionMatch[1]} X ${dimensionMatch[2]}`;
        confidence += 15;
    }
    
    // Extract material types
    if (description.includes('STL') || description.includes('STEEL')) {
        material = 'Steel';
        confidence += 10;
    } else if (description.includes('HRS')) {
        material = 'Steel (HRS)';
        confidence += 10;
    } else if (description.includes('TUBING')) {
        material = 'Tubing';
        confidence += 10;
    }
    
    const boundedConfidence = Math.min(confidence, 100);
    
    return {
        qty: qty || '1',
        partNumber: partNumber,
        description: description,
        length: length,
        material: material,
        process: process,
        finish: finish,
        type: description.includes('CAST') ? 'Casting' : 'Hardware',
        confidence: boundedConfidence
    };
}

function addBOMRowToTable(item) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox"></td>
        <td><input type="number" value="${item.qty}" min="1"></td>
        <td><input type="text" value="${item.partNumber}"></td>
        <td><input type="text" value="${item.description}"></td>
        <td><input type="text" value="${item.length}"></td>
        <td><input type="text" value="${item.material}"></td>
        <td><input type="text" value="${item.process}"></td>
        <td><input type="text" value="${item.finish}"></td>
        <td><input type="text" value="${item.type}"></td>
    `;
    bomTableBody.appendChild(row);
}

// Table Management
function addTableRow() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="checkbox" class="row-checkbox"></td>
        <td><input type="number" min="1" value="1"></td>
        <td><input type="text" placeholder="Part #"></td>
        <td><input type="text" placeholder="Description"></td>
        <td><input type="text" placeholder="Length"></td>
        <td><input type="text" placeholder="Material"></td>
        <td><input type="text" placeholder="Process"></td>
        <td><input type="text" placeholder="Finish"></td>
        <td><input type="text" placeholder="Type"></td>
    `;
    bomTableBody.appendChild(row);
}

function deleteSelectedRows() {
    const checkboxes = document.querySelectorAll('.row-checkbox:checked');
    checkboxes.forEach(checkbox => {
        checkbox.closest('tr').remove();
    });
    selectAllCheckbox.checked = false;
    showStatus('Selected rows deleted', 'info');
    updateStatistics();
}

function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.row-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// Validation Report
function generateValidationReport() {
    globalState.validationReport = [];
    const reportContainer = document.getElementById('validationReport');
    reportContainer.innerHTML = '';
    
    const items = globalState.extractedData.bomItems;
    
    items.forEach((item, index) => {
        const reportItem = {
            rowNumber: index + 1,
            pdfValue: item.partNumber || 'N/A',
            excelField: 'Part Number',
            filledValue: item.partNumber,
            confidence: item.confidence
        };
        globalState.validationReport.push(reportItem);
        
        const div = document.createElement('div');
        div.className = 'validation-item';
        div.innerHTML = `
            <div class="validation-row">
                <strong>Row ${reportItem.rowNumber}</strong>
                <span class="confidence-score confidence-${getConfidenceLevel(reportItem.confidence)}">
                    ${reportItem.confidence}%
                </span>
            </div>
            <div class="validation-row">
                <span>PDF Value: <strong>${reportItem.pdfValue}</strong></span>
                <span>Field: <strong>${reportItem.excelField}</strong></span>
            </div>
            <div class="validation-row">
                <span>Filled: <strong>${reportItem.filledValue}</strong></span>
            </div>
        `;
        reportContainer.appendChild(div);
    });
}

function getConfidenceLevel(confidence) {
    if (confidence >= 75) return 'high';
    if (confidence >= 50) return 'medium';
    return 'low';
}

// Statistics
function updateStatistics() {
    const rows = bomTableBody.querySelectorAll('tr');
    document.getElementById('totalItems').textContent = rows.length;
    
    let totalQty = 0;
    rows.forEach(row => {
        const qtyInput = row.querySelector('input[type="number"]');
        if (qtyInput) {
            totalQty += parseInt(qtyInput.value) || 0;
        }
    });
    document.getElementById('totalQty').textContent = totalQty;
    document.getElementById('extractStatus').textContent = 'Completed';
}

// Excel Export
function exportToExcel() {
    try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Prepare data from table
        const tableData = [];
        
        // Add header
        tableData.push([
            'QTY',
            'PART NUMBER',
            'DESCRIPTION',
            'LENGTH',
            'MATERIAL',
            'PROCESS REQUIRED',
            'SURFACE FINISH',
            'TYPE'
        ]);
        
        // Add rows from table
        const rows = bomTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input[type="text"], input[type="number"]');
            if (inputs.length > 1) {
                const rowData = [];
                inputs.forEach((input, index) => {
                    if (index > 0) { // Skip checkbox
                        rowData.push(input.value);
                    }
                });
                if (rowData.some(cell => cell)) { // Only add if row has data
                    tableData.push(rowData);
                }
            }
        });
        
        // Create project info sheet
        const projectInfo = [
            ['PROJECT INFORMATION'],
            [],
            ['Project Number:', document.getElementById('projectNumber').value],
            ['Project Name:', document.getElementById('projectName').value],
            ['Revision:', document.getElementById('revision').value],
            ['Part Number:', document.getElementById('partNumber').value],
            [],
            ['BOM DATA'],
            ...tableData
        ];
        
        // Add worksheet
        const ws = XLSX.utils.aoa_to_sheet(projectInfo);
        
        // Apply formatting
        ws['!cols'] = [
            { wch: 8 },
            { wch: 15 },
            { wch: 35 },
            { wch: 15 },
            { wch: 12 },
            { wch: 15 },
            { wch: 18 },
            { wch: 12 }
        ];
        
        // Style headers
        const headerRow = 8;
        for (let i = 0; i < tableData[0].length; i++) {
            const cellRef = XLSX.utils.encode_col(i) + headerRow;
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    fill: { fgColor: { rgb: 'FF2563eb' } },
                    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
        }
        
        XLSX.utils.book_append_sheet(wb, ws, 'BOM Data');
        
        // Download
        const filename = `BOM_${document.getElementById('projectNumber').value || 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
        
        showStatus('Excel file exported successfully!', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showStatus('Error exporting Excel: ' + error.message, 'error');
    }
}

// JSON Export
function exportJSON() {
    try {
        const rows = bomTableBody.querySelectorAll('tr');
        const bomItems = [];
        
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input[type="text"], input[type="number"]');
            if (inputs.length > 1) {
                bomItems.push({
                    qty: inputs[0].value,
                    partNumber: inputs[1].value,
                    description: inputs[2].value,
                    length: inputs[3].value,
                    material: inputs[4].value,
                    process: inputs[5].value,
                    finish: inputs[6].value,
                    type: inputs[7].value
                });
            }
        });
        
        const jsonData = {
            projectNumber: document.getElementById('projectNumber').value,
            projectName: document.getElementById('projectName').value,
            revision: document.getElementById('revision').value,
            partNumber: document.getElementById('partNumber').value,
            extractedDate: new Date().toISOString(),
            totalItems: bomItems.length,
            bomItems: bomItems,
            validationReport: globalState.validationReport
        };
        
        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `BOM_${document.getElementById('projectNumber').value || 'Data'}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        showStatus('JSON file exported successfully!', 'success');
        
    } catch (error) {
        console.error('JSON export error:', error);
        showStatus('Error exporting JSON: ' + error.message, 'error');
    }
}

// Download Report
function downloadReport() {
    try {
        let reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BOM Extraction Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f0f0f0; font-weight: bold; }
        .confidence-high { background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 3px; }
        .confidence-medium { background: #fef3c7; color: #78350f; padding: 4px 8px; border-radius: 3px; }
        .confidence-low { background: #fee2e2; color: #7f1d1d; padding: 4px 8px; border-radius: 3px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-item { background: #f9fafb; padding: 10px; border-radius: 3px; border-left: 3px solid #2563eb; }
        .info-label { font-weight: bold; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>BOM Extraction Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
`;

        // Project Information
        reportHTML += `
    <div class="section">
        <h2>Project Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Project Number:</div>
                <div>${document.getElementById('projectNumber').value || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Project Name:</div>
                <div>${document.getElementById('projectName').value || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Revision:</div>
                <div>${document.getElementById('revision').value || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Part Number:</div>
                <div>${document.getElementById('partNumber').value || 'N/A'}</div>
            </div>
        </div>
    </div>
`;

        // Validation Report
        reportHTML += `
    <div class="section">
        <h2>Validation Report</h2>
        <table>
            <thead>
                <tr>
                    <th>Row</th>
                    <th>PDF Value</th>
                    <th>Excel Field</th>
                    <th>Filled Value</th>
                    <th>Confidence</th>
                </tr>
            </thead>
            <tbody>
`;

        globalState.validationReport.forEach(report => {
            const confidenceClass = `confidence-${getConfidenceLevel(report.confidence)}`;
            reportHTML += `
                <tr>
                    <td>${report.rowNumber}</td>
                    <td>${report.pdfValue}</td>
                    <td>${report.excelField}</td>
                    <td>${report.filledValue}</td>
                    <td><span class="${confidenceClass}">${report.confidence}%</span></td>
                </tr>
`;
        });

        reportHTML += `
            </tbody>
        </table>
    </div>
`;

        // BOM Table
        reportHTML += `
    <div class="section">
        <h2>BOM Items</h2>
        <table>
            <thead>
                <tr>
                    <th>QTY</th>
                    <th>Part Number</th>
                    <th>Description</th>
                    <th>Length</th>
                    <th>Material</th>
                    <th>Process</th>
                    <th>Finish</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
`;

        const rows = bomTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input[type="text"], input[type="number"]');
            if (inputs.length > 1) {
                reportHTML += `
                <tr>
                    <td>${inputs[0].value}</td>
                    <td>${inputs[1].value}</td>
                    <td>${inputs[2].value}</td>
                    <td>${inputs[3].value}</td>
                    <td>${inputs[4].value}</td>
                    <td>${inputs[5].value}</td>
                    <td>${inputs[6].value}</td>
                    <td>${inputs[7].value}</td>
                </tr>
`;
            }
        });

        reportHTML += `
            </tbody>
        </table>
    </div>
`;

        reportHTML += `
    <div class="section">
        <h2>Summary Statistics</h2>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Total Items:</div>
                <div>${document.getElementById('totalItems').textContent}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Total Quantity:</div>
                <div>${document.getElementById('totalQty').textContent}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Extraction Status:</div>
                <div>${document.getElementById('extractStatus').textContent}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Generated:</div>
                <div>${new Date().toLocaleString()}</div>
            </div>
        </div>
    </div>
</body>
</html>
`;

        const blob = new Blob([reportHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `BOM_Report_${document.getElementById('projectNumber').value || 'Export'}_${new Date().toISOString().split('T')[0]}.html`;
        link.click();
        URL.revokeObjectURL(url);

        showStatus('Report downloaded successfully!', 'success');

    } catch (error) {
        console.error('Report download error:', error);
        showStatus('Error downloading report: ' + error.message, 'error');
    }
}

// Loading Modal
function showLoading(show, message = 'Processing...') {
    if (show) {
        loadingText.textContent = message;
        loadingModal.style.display = 'flex';
    } else {
        loadingModal.style.display = 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeEventListeners);
