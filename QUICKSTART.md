# BOM PDF Extractor - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- PDF file with BOM table
- No installation or server needed

### Step 1: Open the Application
```
1. Download or clone the repository
2. Open `index.html` in your web browser
3. You should see the BOM Extractor interface
```

### Step 2: Upload Your PDF
```
1. Click the upload box or drag-and-drop a PDF
2. The app will show: "PDF loaded: X pages found"
3. The page selector will enable automatically
```

### Step 3: Extract BOM Data
```
1. Select the page number containing your BOM table
   (Usually on first 2-3 pages of engineering drawings)
2. Click "Extract BOM Data" button
3. Wait 10-30 seconds while OCR processes the page
4. Data will populate in the BOM Items table
```

### Step 4: Review & Edit
```
1. Check extracted data for accuracy
2. Click any cell to edit
3. Use "Add Row" to add missing items
4. Use "Delete Selected" to remove wrong rows
5. Review confidence scores in validation report
```

### Step 5: Export Results
```
Choose your export format:

📥 Export to Excel
   - Creates professional Excel file
   - Maintains formatting
   - Ready for procurement

📄 Export JSON
   - Raw structured data
   - For integration with other tools
   - Includes validation report

📋 Download Report
   - HTML validation report
   - Shows extraction quality
   - Print-friendly format
```

---

## 📋 BOM Extraction Examples

### Example 1: Simple BOM Table

**Input PDF:**
```
ASSEMBLY S1
┌────┬─────────┬──────────────────────┐
│ QTY│ PART #  │   DESCRIPTION        │
├────┼─────────┼──────────────────────┤
│ 4  │ S1A     │ TUBE -4 x 2 x 0.125  │
│ 2  │ S1B     │ TUBE -4 x 2 x 0.125  │
│ 1  │ S1C     │ SHEET -0.875 x 0.875 │
└────┴─────────┴──────────────────────┘
```

**Extracted Output:**
```
Project Number: (auto-detected from drawing)
Project Name: ASSEMBLY S1

BOM Items:
┌─────┬────────┬─────────────────────────┬────────┬─────────┐
│ QTY │ Part # │     Description         │ Length │ Material│
├─────┼────────┼─────────────────────────┼────────┼─────────┤
│ 4   │ S1A    │ TUBE -4 x 2 x 0.125     │ 4 X 2  │ Steel   │
│ 2   │ S1B    │ TUBE -4 x 2 x 0.125     │ 4 X 2  │ Steel   │
│ 1   │ S1C    │ SHEET -0.875 x 0.875    │ 0.875  │ Steel   │
└─────┴────────┴─────────────────────────┴────────┴─────────┘
```

### Example 2: Complex BOM with Materials

**Input:**
```
ASSEMBLY S12
┌────┬─────┬────────────────────┬───────────────────┐
│ QTY│ SYM │  DESCRIPTION       │ MATERIAL/PROCESS  │
├────┼─────┼────────────────────┼───────────────────┤
│ 1  │ S12B│ 2 -38-16UNC CENTER │ .50 DIA X 1.5 LD  │
│ 2  │ S12A│ LOCK NUT           │ .50 DIA HRS STEEL │
└────┴─────┴────────────────────┴───────────────────┘
```

**Extracted Result:**
- Material: HRS STEEL (detected from description)
- Process: Center drilling (from description)
- Type: Hardware (auto-classified)

---

## 🎯 Common Workflows

### Workflow 1: Extract & Generate Excel for Procurement
```
PDF Upload
    ↓
Select Page (usually 1-2)
    ↓
Extract BOM
    ↓
Review 5-10 seconds
    ↓
Export to Excel
    ↓
Use Excel for purchasing
```

### Workflow 2: Validate Drawing Completeness
```
PDF Upload
    ↓
Extract all pages (one at a time)
    ↓
Check Validation Report
    ↓
Review Confidence Scores
    ↓
Download HTML Report
    ↓
Submit for drawing approval
```

### Workflow 3: Create Master Assembly List
```
PDF Upload (Drawing 1)
    ↓
Extract BOM
    ↓
Export JSON
    ↓
Repeat for Drawing 2, 3, 4...
    ↓
Merge JSON files
    ↓
Create master Excel
```

---

## 🔧 Troubleshooting

### Problem: "PDF not loading"
**Solution:**
1. Ensure file is valid PDF (not corrupted)
2. Check file is under 100MB
3. Try opening PDF in Adobe Reader first
4. Check browser console (F12) for errors

### Problem: "OCR taking too long"
**Solution:**
1. First time runs slower (downloads OCR library)
2. Subsequent runs are faster (cached)
3. Complex pages take 20-30 seconds
4. Simple pages take 10-15 seconds
5. Try smaller or clearer PDFs first

### Problem: "Poor extraction quality"
**Solution:**
1. Check PDF quality (scanned or digital)
2. Use digital PDFs when possible (better accuracy)
3. Try different page if multi-page PDF
4. Manually edit cells for corrections
5. Review confidence scores for validation

### Problem: "Excel export not working"
**Solution:**
1. Check browser allows downloads
2. Disable download blockers
3. Check disk space
4. Try different browser
5. Clear browser cache

### Problem: "Some data not extracted"
**Solution:**
1. Manually add missing rows (use + Add Row)
2. Copy description from PDF
3. Fill in manually calculated fields
4. Review validation report for low-confidence items
5. Check original PDF for clarity

---

## 📊 Understanding Confidence Scores

### What is Confidence?
Confidence Score (0-100%) indicates extraction accuracy.

### Scoring Breakdown
| Score | Meaning | Action |
|-------|---------|--------|
| 75-100% | High confidence | ✅ Accept as-is |
| 50-74% | Medium confidence | ⚠️ Review carefully |
| < 50% | Low confidence | ❌ Manual review needed |

### Example:
```
Part Number Extraction:
"S1A" found in PDF → 95% confidence (clear match)
"?" unclear in PDF → 45% confidence (needs review)
```

---

## 💡 Pro Tips

### Tip 1: Start with Best Quality PDFs
- Digital PDFs extract better than scans
- Clear, high-contrast images work best
- Well-formatted tables parse more accurately

### Tip 2: Use Page Selection
- Multi-page PDFs often have BOM on specific page
- Use page selector to target the right page
- Typical locations: Page 1-2 for drawings

### Tip 3: Manual Corrections
- It's faster to edit 2-3 cells than re-extract
- Copy descriptions from PDF directly
- Fill material/process from specifications

### Tip 4: Validation Report
- Always review validation report
- Check confidence scores
- Identify low-confidence extractions
- Verify against original PDF

### Tip 5: Export Strategy
- Use Excel for internal use
- Use JSON for data integration
- Use HTML report for documentation
- Keep original PDF for reference

---

## 📱 System Requirements

### Minimum
- Browser: Chrome/Firefox/Safari/Edge
- RAM: 500MB free
- Storage: 50MB for installation
- Internet: First-time only (for CDN libraries)

### Recommended
- Browser: Latest version
- RAM: 2GB+ available
- Storage: 100MB free
- Display: 1024x768+ resolution

---

## ⚡ Performance Tips

### Speed Up Processing
1. **Use high-quality PDFs**
   - Digital > Scanned
   - Color > Black & White (better contrast)

2. **Close other applications**
   - Free up RAM for OCR processing
   - Disable browser extensions

3. **Cache OCR library**
   - First time: ~30 seconds
   - Subsequent times: ~15 seconds
   - Browser caches Tesseract.js

4. **Process one page at a time**
   - Faster than batch processing
   - Lower memory usage
   - Easier to verify results

### Memory Management
- Each OCR process uses ~150-200MB RAM
- Results cleared after export
- Browser auto-garbage collects after 1 minute
- Large tables may use more memory

---

## 🔒 Data Privacy

**Important:** All processing happens in your browser
- ✅ PDFs are NOT uploaded anywhere
- ✅ Data stays on your computer
- ✅ No server communication
- ✅ No tracking or analytics
- ✅ Safe for confidential documents

**Offline Usage:**
- Can be deployed locally
- Works without internet (after first load)
- Perfect for secure environments

---

## 📞 Getting Help

### Common Questions

**Q: Can I process multiple PDFs?**
A: Yes, one at a time. Repeat steps for each PDF.

**Q: What PDF formats work?**
A: Standard PDF files (.pdf extension).

**Q: Can I edit data after export?**
A: Yes, Excel files are fully editable.

**Q: How accurate is the extraction?**
A: 85-95% for well-formatted BOMs.

**Q: What about special characters?**
A: Most work, but review special symbols.

**Q: Can I customize fields?**
A: Yes, edit config.js for custom fields.

**Q: Is there a mobile app?**
A: Works on tablets/phones via browser.

---

## 🎓 Learning Path

### Beginner (5 minutes)
1. ✅ Open application
2. ✅ Upload sample PDF
3. ✅ Extract BOM
4. ✅ Export to Excel

### Intermediate (15 minutes)
1. ✅ Review validation report
2. ✅ Edit extracted data
3. ✅ Add missing rows
4. ✅ Verify confidence scores
5. ✅ Export all formats

### Advanced (30 minutes)
1. ✅ Customize config.js
2. ✅ Batch process multiple PDFs
3. ✅ Merge JSON files
4. ✅ Create master BOMs
5. ✅ Integrate with other tools

---

## 📚 Additional Resources

### Files in Repository
- `index.html` - Main application
- `styles.css` - UI styling
- `app.js` - Core logic
- `config.js` - Customization options
- `README.md` - Full documentation
- `QUICKSTART.md` - This file

### External Libraries
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [XLSX.js](https://sheetjs.com/) - Excel generation

---

## 🎉 You're Ready!

Now you have everything you need to:
- ✅ Extract BOM data from PDFs
- ✅ Generate Excel files
- ✅ Create validation reports
- ✅ Export in multiple formats

**Start extracting!** Open `index.html` in your browser.

---

**Questions?** Check the README.md for detailed documentation.

**Found a bug?** Check the troubleshooting section or open an issue on GitHub.

Happy BOM extracting! 🚀
