// BOM PDF Extractor - Utility Helper Functions
// Advanced features and helper functions for enhanced functionality

/**
 * Data Validation & Processing Utilities
 */
const DataValidator = {
    /**
     * Validate BOM item
     * @param {Object} item - BOM item to validate
     * @returns {Object} Validation result {valid: boolean, errors: array}
     */
    validateBOMItem(item) {
        const errors = [];
        
        if (!item.partNumber || item.partNumber.trim() === '') {
            errors.push('Part Number is required');
        }
        
        if (!item.description || item.description.trim() === '') {
            errors.push('Description is required');
        }
        
        if (item.qty && isNaN(parseInt(item.qty))) {
            errors.push('Quantity must be a number');
        }
        
        if (item.qty && parseInt(item.qty) < 1) {
            errors.push('Quantity must be at least 1');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    /**
     * Check for duplicate part numbers
     * @param {Array} items - Array of BOM items
     * @returns {Object} Duplicates found {hasDuplicates: boolean, duplicates: array}
     */
    findDuplicates(items) {
        const partNumbers = {};
        const duplicates = [];
        
        items.forEach(item => {
            const partNum = item.partNumber;
            if (partNumbers[partNum]) {
                if (!duplicates.includes(partNum)) {
                    duplicates.push(partNum);
                }
                partNumbers[partNum]++;
            } else {
                partNumbers[partNum] = 1;
            }
        });
        
        return {
            hasDuplicates: duplicates.length > 0,
            duplicates: duplicates,
            counts: partNumbers
        };
    },

    /**
     * Validate entire BOM table
     * @param {Array} items - Array of BOM items
     * @returns {Object} Complete validation report
     */
    validateBOM(items) {
        const validation = {
            totalItems: items.length,
            validItems: 0,
            invalidItems: 0,
            warnings: [],
            errors: [],
            itemValidation: []
        };

        items.forEach((item, index) => {
            const result = this.validateBOMItem(item);
            validation.itemValidation.push({
                row: index + 1,
                valid: result.valid,
                errors: result.errors
            });

            if (result.valid) {
                validation.validItems++;
            } else {
                validation.invalidItems++;
                validation.errors.push(...result.errors.map(e => `Row ${index + 1}: ${e}`));
            }
        });

        // Check for duplicates
        const duplicateCheck = this.findDuplicates(items);
        if (duplicateCheck.hasDuplicates) {
            validation.warnings.push(`Duplicate part numbers found: ${duplicateCheck.duplicates.join(', ')}`);
        }

        // Check for empty descriptions
        const emptyDescriptions = items
            .map((item, i) => item.description === '' ? i + 1 : null)
            .filter(v => v !== null);
        
        if (emptyDescriptions.length > 0) {
            validation.warnings.push(`Rows with empty descriptions: ${emptyDescriptions.join(', ')}`);
        }

        return validation;
    }
};

/**
 * Excel Generation Utilities
 */
const ExcelUtils = {
    /**
     * Create styled Excel header
     * @param {XLSX.Workbook} workbook - XLSX workbook
     * @returns {Object} Header style object
     */
    getHeaderStyle() {
        return {
            fill: {
                fgColor: { rgb: 'FF2563eb' }
            },
            font: {
                bold: true,
                color: { rgb: 'FFFFFFFF' }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true
            },
            border: {
                left: { style: 'thin' },
                right: { style: 'thin' },
                top: { style: 'thin' },
                bottom: { style: 'thin' }
            }
        };
    },

    /**
     * Create alternating row style
     * @param {number} rowIndex - Row index
     * @returns {Object} Row style object
     */
    getRowStyle(rowIndex) {
        const isEvenRow = rowIndex % 2 === 0;
        return {
            fill: {
                fgColor: { rgb: isEvenRow ? 'FFFAFAFA' : 'FFFFFFFF' }
            },
            border: {
                left: { style: 'thin' },
                right: { style: 'thin' },
                bottom: { style: 'thin' }
            }
        };
    },

    /**
     * Set column widths
     * @param {XLSX.Worksheet} worksheet - XLSX worksheet
     */
    setColumnWidths(worksheet) {
        worksheet['!cols'] = [
            { wch: 8 },   // QTY
            { wch: 15 },  // Part Number
            { wch: 35 },  // Description
            { wch: 15 },  // Length
            { wch: 12 },  // Material
            { wch: 15 },  // Process
            { wch: 18 },  // Surface Finish
            { wch: 12 }   // Type
        ];
    },

    /**
     * Create formatted Excel with multiple sheets
     * @param {Object} data - BOM data
     * @returns {XLSX.Workbook} Formatted workbook
     */
    createFormattedWorkbook(data) {
        const wb = XLSX.utils.book_new();

        // Project Info Sheet
        const projectData = [
            ['BOM EXTRACTION REPORT'],
            [],
            ['Project Information'],
            ['Project Number:', data.projectNumber || 'N/A'],
            ['Project Name:', data.projectName || 'N/A'],
            ['Revision:', data.revision || 'N/A'],
            ['Part Number:', data.partNumber || 'N/A'],
            ['Extracted Date:', new Date().toLocaleString()],
            []
        ];

        const projectWs = XLSX.utils.aoa_to_sheet(projectData);
        XLSX.utils.book_append_sheet(wb, projectWs, 'Project Info');

        // BOM Data Sheet
        const bomHeaders = ['QTY', 'Part Number', 'Description', 'Length', 'Material', 'Process', 'Surface Finish', 'Type'];
        const bomRows = data.bomItems.map(item => [
            item.qty,
            item.partNumber,
            item.description,
            item.length,
            item.material,
            item.process,
            item.finish,
            item.type
        ]);

        const bomData = [bomHeaders, ...bomRows];
        const bomWs = XLSX.utils.aoa_to_sheet(bomData);

        // Apply formatting
        this.setColumnWidths(bomWs);
        
        // Style header row
        for (let i = 0; i < bomHeaders.length; i++) {
            const cellRef = XLSX.utils.encode_col(i) + '1';
            if (bomWs[cellRef]) {
                bomWs[cellRef].s = this.getHeaderStyle();
            }
        }

        // Style data rows
        for (let i = 1; i <= bomRows.length; i++) {
            for (let j = 0; j < bomHeaders.length; j++) {
                const cellRef = XLSX.utils.encode_col(j) + (i + 1);
                if (bomWs[cellRef]) {
                    bomWs[cellRef].s = this.getRowStyle(i);
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, bomWs, 'BOM Data');

        return wb;
    }
};

/**
 * Text Processing Utilities
 */
const TextUtils = {
    /**
     * Clean and normalize text
     * @param {string} text - Text to clean
     * @returns {string} Cleaned text
     */
    cleanText(text) {
        if (!text) return '';
        
        return text
            .trim()
            .replace(/\s+/g, ' ')           // Remove extra spaces
            .replace(/[^\w\s\-./]/g, '')    // Remove special characters
            .toUpperCase();
    },

    /**
     * Extract dimensions from text
     * @param {string} text - Text containing dimensions
     * @returns {Array} Array of dimension strings
     */
    extractDimensions(text) {
        if (!text) return [];
        
        const dimensionPattern = /(\d+\.?\d*)\s*(?:X|x|×)\s*(\d+\.?\d*)/g;
        const matches = [];
        let match;

        while ((match = dimensionPattern.exec(text)) !== null) {
            matches.push(`${match[1]} X ${match[2]}`);
        }

        return matches;
    },

    /**
     * Extract numbers from text
     * @param {string} text - Text containing numbers
     * @returns {Array} Array of numbers
     */
    extractNumbers(text) {
        if (!text) return [];
        
        const numberPattern = /\d+\.?\d*/g;
        return text.match(numberPattern) || [];
    },

    /**
     * Identify material from text
     * @param {string} text - Text to analyze
     * @returns {string} Identified material type
     */
    identifyMaterial(text) {
        if (!text) return '';
        
        const textUpper = text.toUpperCase();
        
        if (textUpper.includes('STEEL') || textUpper.includes('STL') || textUpper.includes('HRS')) {
            return 'Steel';
        }
        if (textUpper.includes('ALUMINUM') || textUpper.includes('ALU')) {
            return 'Aluminum';
        }
        if (textUpper.includes('BRASS')) {
            return 'Brass';
        }
        if (textUpper.includes('TUBING') || textUpper.includes('TUBE')) {
            return 'Tubing';
        }
        if (textUpper.includes('PLASTIC') || textUpper.includes('ABS') || textUpper.includes('PVC')) {
            return 'Plastic';
        }
        if (textUpper.includes('CAST')) {
            return 'Casting';
        }
        
        return '';
    },

    /**
     * Identify process from text
     * @param {string} text - Text to analyze
     * @returns {string} Identified process type
     */
    identifyProcess(text) {
        if (!text) return '';
        
        const textUpper = text.toUpperCase();
        
        if (textUpper.includes('WELD')) return 'Welding';
        if (textUpper.includes('BEND')) return 'Bending';
        if (textUpper.includes('DRILL')) return 'Drilling';
        if (textUpper.includes('CUT')) return 'Cutting';
        if (textUpper.includes('MACHINE') || textUpper.includes('CNC')) return 'Machining';
        
        return '';
    }
};

/**
 * File Processing Utilities
 */
const FileUtils = {
    /**
     * Format filename with timestamp
     * @param {string} base - Base filename
     * @param {string} extension - File extension
     * @returns {string} Formatted filename
     */
    formatFilename(base, extension) {
        const timestamp = new Date().toISOString().split('T')[0];
        return `${base}_${timestamp}.${extension}`;
    },

    /**
     * Read file as ArrayBuffer
     * @param {File} file - File object
     * @returns {Promise} Promise resolving to ArrayBuffer
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Read file as Data URL
     * @param {File} file - File object
     * @returns {Promise} Promise resolving to Data URL
     */
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Download blob as file
     * @param {Blob} blob - Blob object
     * @param {string} filename - Filename
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

/**
 * Storage Utilities
 */
const StorageUtils = {
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {Object} data - Data to save
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`Saved to storage: ${key}`);
        } catch (error) {
            console.error(`Storage error: ${error}`);
        }
    },

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {Object} defaultValue - Default if not found
     * @returns {Object} Stored data or default
     */
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Storage error: ${error}`);
            return defaultValue;
        }
    },

    /**
     * Remove data from storage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            console.log(`Removed from storage: ${key}`);
        } catch (error) {
            console.error(`Storage error: ${error}`);
        }
    },

    /**
     * Clear all storage
     */
    clear() {
        try {
            localStorage.clear();
            console.log('Storage cleared');
        } catch (error) {
            console.error(`Storage error: ${error}`);
        }
    }
};

/**
 * Logging Utilities
 */
const Logger = {
    logs: [],
    maxLogs: 1000,

    /**
     * Log message
     * @param {string} message - Log message
     * @param {string} level - Log level (debug, info, warn, error)
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message
        };

        this.logs.push(logEntry);

        // Maintain max logs limit
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    },

    /**
     * Get all logs
     * @returns {Array} Array of log entries
     */
    getLogs() {
        return this.logs;
    },

    /**
     * Export logs as JSON
     * @returns {string} JSON string of logs
     */
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    },

    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
    }
};

/**
 * Performance Monitoring
 */
const Performance = {
    timers: {},

    /**
     * Start performance timer
     * @param {string} name - Timer name
     */
    startTimer(name) {
        this.timers[name] = performance.now();
    },

    /**
     * End performance timer and get duration
     * @param {string} name - Timer name
     * @returns {number} Duration in milliseconds
     */
    endTimer(name) {
        if (!this.timers[name]) {
            console.warn(`Timer "${name}" not found`);
            return 0;
        }

        const duration = performance.now() - this.timers[name];
        delete this.timers[name];

        Logger.log(`${name} completed in ${duration.toFixed(2)}ms`, 'info');
        return duration;
    },

    /**
     * Measure execution time of function
     * @param {string} name - Measurement name
     * @param {Function} fn - Function to measure
     * @returns {*} Function result
     */
    measure(name, fn) {
        this.startTimer(name);
        const result = fn();
        this.endTimer(name);
        return result;
    }
};

/**
 * Export all utilities
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataValidator,
        ExcelUtils,
        TextUtils,
        FileUtils,
        StorageUtils,
        Logger,
        Performance
    };
}
