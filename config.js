// BOM PDF Extractor - Configuration File
// Customize extraction patterns, parsing rules, and UI behavior

const CONFIG = {
    // ===== OCR Configuration =====
    ocr: {
        language: 'eng',
        resolution: 2, // Scale factor for PDF rendering before OCR
        timeout: 120000, // OCR timeout in milliseconds
        debug: false // Enable detailed console logging
    },

    // ===== BOM Parsing Rules =====
    bom: {
        // Keywords to detect BOM section in text
        sectionKeywords: ['ASSEMBLY', 'QTY', 'PART NUMBER', 'DESCRIPTION', 'BILL OF MATERIALS', 'BOM'],
        
        // Skip lines containing these keywords
        skipKeywords: ['AMT', 'SYM', 'SHT', 'NAME OR STOCK', 'TOTAL', 'SHEET'],
        
        // Minimum line length to process
        minLineLength: 5,
        
        // Field separator patterns (regex)
        fieldSeparators: /\s{2,}|[\t|]/,
        
        // Confidence thresholds
        confidence: {
            threshold: 50, // Minimum confidence to include item
            high: 75,      // High confidence score
            medium: 50,    // Medium confidence score
            low: 0         // Low confidence score
        }
    },

    // ===== Pattern Matching Rules =====
    patterns: {
        // Project Number (e.g., U71B, P123, etc.)
        projectNumber: /([A-Z]\d{2,3}[A-Z]?)/,
        
        // Assembly Name (e.g., ASSEMBLY S1, ASSEMBLY S12)
        assemblyName: /ASSEMBLY\s+([S\d]+)/,
        
        // Revision (e.g., A, B1, Rev A, etc.)
        revision: /REV[A-Z]?[\s:]+([A-Z0-9])/i,
        
        // Part Number (e.g., S1A, S1B, 12345, ABC-123)
        partNumber: /^[A-Z]\d+[A-Z]?$|^[A-Z0-9]{3,}$/,
        
        // Quantity (numeric)
        quantity: /^\d+$|^(\d+)/,
        
        // Dimensions (e.g., 4 x 2 x 0.125, 40.00, etc.)
        dimensions: /(\d+\.?\d*)\s*(?:X|x)\s*(\d+\.?\d*)/,
        
        // Material keywords
        materials: {
            steel: ['STL', 'STEEL', 'HRS'],
            tubing: ['TUBING', 'TUBE', 'PIPE'],
            sheet: ['SHEET', 'PLATE'],
            casting: ['CAST', 'CASTING'],
            plastic: ['PLASTIC', 'ABS', 'PVC', 'HDPE']
        },
        
        // Process keywords
        processes: {
            welding: ['WELD', 'WELDING'],
            bending: ['BEND', 'BENDING'],
            cutting: ['CUT', 'CUTTING'],
            drilling: ['DRILL', 'DRILLING'],
            machining: ['MACHINE', 'MACHINING', 'CNC']
        },
        
        // Surface finish keywords
        finishes: {
            painted: ['PAINT', 'PAINTED'],
            plated: ['PLATE', 'PLATED', 'ZINC'],
            anodized: ['ANODIZE', 'ANODIZED'],
            polished: ['POLISH', 'POLISHED'],
            natural: ['NATURAL', 'AS-IS']
        }
    },

    // ===== Table Configuration =====
    table: {
        // Column definitions
        columns: [
            { name: 'qty', label: 'QTY', width: 60, type: 'number' },
            { name: 'partNumber', label: 'Part Number', width: 120, type: 'text' },
            { name: 'description', label: 'Description', width: 250, type: 'text' },
            { name: 'length', label: 'Length', width: 100, type: 'text' },
            { name: 'material', label: 'Material', width: 120, type: 'text' },
            { name: 'process', label: 'Process', width: 120, type: 'text' },
            { name: 'finish', label: 'Surface Finish', width: 120, type: 'text' },
            { name: 'type', label: 'Type', width: 100, type: 'text' }
        ],
        
        // Default values for new rows
        defaults: {
            qty: '1',
            partNumber: '',
            description: '',
            length: '',
            material: '',
            process: '',
            finish: '',
            type: 'Hardware'
        },
        
        // Item type options
        types: ['Hardware', 'Casting', 'Bought-out', 'Assembly', 'Fastener', 'Sheet Metal']
    },

    // ===== Export Configuration =====
    export: {
        // Excel settings
        excel: {
            headerStyle: {
                fill: 'FF2563eb',        // Blue
                fontColor: 'FFFFFFFF',   // White
                bold: true
            },
            dateFormat: 'YYYY-MM-DD',
            sheetName: 'BOM Data',
            filename: 'BOM_{PROJECT}_{DATE}'
        },
        
        // JSON settings
        json: {
            prettyPrint: true,
            indentation: 2,
            includeMetadata: true,
            includeValidation: true
        },
        
        // HTML Report settings
        html: {
            theme: 'light', // 'light' or 'dark'
            includeStats: true,
            includeValidation: true,
            includeBOM: true,
            pageOrientation: 'portrait'
        }
    },

    // ===== UI Configuration =====
    ui: {
        // Colors
        colors: {
            primary: '#2563eb',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        },
        
        // Animation settings
        animation: {
            enabled: true,
            speed: 300 // milliseconds
        },
        
        // Message display time
        messageTimeout: 4000, // milliseconds
        
        // Modal settings
        modal: {
            backdrop: true,
            keyboard: true,
            closeButton: true
        }
    },

    // ===== Validation Rules =====
    validation: {
        // Required fields
        requiredFields: ['partNumber', 'description'],
        
        // Minimum confidence for auto-acceptance
        minAutoAccept: 75,
        
        // Warn on these conditions
        warnings: {
            emptyQty: true,
            emptyDescription: true,
            duplicatePartNumber: true,
            lowConfidence: true
        },
        
        // Field-specific rules
        fieldRules: {
            qty: {
                min: 1,
                max: 9999,
                type: 'number'
            },
            partNumber: {
                minLength: 1,
                maxLength: 50,
                type: 'string'
            },
            description: {
                minLength: 5,
                maxLength: 255,
                type: 'string'
            }
        }
    },

    // ===== Feature Flags =====
    features: {
        // Enable/disable specific features
        pdfUpload: true,
        ocrExtraction: true,
        manualEditing: true,
        rowAddDelete: true,
        excelExport: true,
        jsonExport: true,
        htmlReport: true,
        validationReport: true,
        statistics: true,
        dragDrop: true,
        batchProcessing: false, // TODO: Implement
        autoCorrection: false,  // TODO: Implement
        advancedFilters: false  // TODO: Implement
    },

    // ===== Logging Configuration =====
    logging: {
        enabled: true,
        level: 'info', // 'debug', 'info', 'warn', 'error'
        console: true,
        file: false,
        maxEntries: 1000
    },

    // ===== Performance Settings =====
    performance: {
        maxFileSize: 104857600, // 100MB in bytes
        maxPages: 100,
        debounceDelay: 300, // milliseconds
        throttleDelay: 100,  // milliseconds
        cacheOCR: true,
        maxCacheSize: 10 // Maximum OCR cache entries
    },

    // ===== Localization =====
    i18n: {
        language: 'en',
        supportedLanguages: ['en', 'es', 'fr', 'de', 'zh'],
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'en-US'
    }
};

// ===== Helper Functions =====

/**
 * Get configuration value by path (e.g., 'bom.confidence.high')
 * @param {string} path - Dot-notation path
 * @param {*} defaultValue - Default if not found
 * @returns {*} Configuration value
 */
function getConfig(path, defaultValue = null) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return defaultValue;
        }
    }
    
    return value;
}

/**
 * Set configuration value by path
 * @param {string} path - Dot-notation path
 * @param {*} value - New value
 */
function setConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let obj = CONFIG;
    
    for (const key of keys) {
        if (!(key in obj)) {
            obj[key] = {};
        }
        obj = obj[key];
    }
    
    obj[lastKey] = value;
    console.log(`Config updated: ${path} = ${value}`);
}

/**
 * Get all material types
 * @returns {Array} Array of material names
 */
function getMaterials() {
    return Object.keys(CONFIG.patterns.materials).flatMap(
        key => CONFIG.patterns.materials[key]
    );
}

/**
 * Get all process types
 * @returns {Array} Array of process names
 */
function getProcesses() {
    return Object.keys(CONFIG.patterns.processes).flatMap(
        key => CONFIG.patterns.processes[key]
    );
}

/**
 * Get all finish types
 * @returns {Array} Array of finish names
 */
function getFinishes() {
    return Object.keys(CONFIG.patterns.finishes).flatMap(
        key => CONFIG.patterns.finishes[key]
    );
}

/**
 * Validate a value against field rules
 * @param {string} fieldName - Field name
 * @param {*} value - Value to validate
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
function validateField(fieldName, value) {
    const rules = CONFIG.validation.fieldRules[fieldName];
    
    if (!rules) {
        return { valid: true };
    }
    
    if (rules.minLength && value.length < rules.minLength) {
        return {
            valid: false,
            error: `Minimum length is ${rules.minLength}`
        };
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        return {
            valid: false,
            error: `Maximum length is ${rules.maxLength}`
        };
    }
    
    if (rules.type === 'number' && isNaN(value)) {
        return {
            valid: false,
            error: 'Must be a number'
        };
    }
    
    if (rules.min !== undefined && value < rules.min) {
        return {
            valid: false,
            error: `Minimum value is ${rules.min}`
        };
    }
    
    if (rules.max !== undefined && value > rules.max) {
        return {
            valid: false,
            error: `Maximum value is ${rules.max}`
        };
    }
    
    return { valid: true };
}

/**
 * Log message with level
 * @param {string} message - Log message
 * @param {string} level - Log level (debug, info, warn, error)
 */
function logMessage(message, level = 'info') {
    if (!CONFIG.logging.enabled) return;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(CONFIG.logging.level);
    const messageLevel = levels.indexOf(level);
    
    if (messageLevel >= currentLevel) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        if (CONFIG.logging.console) {
            console[level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log'](logEntry);
        }
    }
}

/**
 * Format filename with variables
 * @param {string} template - Filename template (e.g., 'BOM_{PROJECT}_{DATE}')
 * @param {Object} variables - Variable values
 * @returns {string} Formatted filename
 */
function formatFilename(template, variables = {}) {
    let filename = template;
    
    Object.keys(variables).forEach(key => {
        filename = filename.replace(`{${key.toUpperCase()}}`, variables[key]);
    });
    
    // Add default date if not specified
    if (filename.includes('{DATE}')) {
        const date = new Date().toISOString().split('T')[0];
        filename = filename.replace('{DATE}', date);
    }
    
    return filename;
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getConfig, setConfig, getMaterials, getProcesses, getFinishes, validateField, logMessage, formatFilename };
}
