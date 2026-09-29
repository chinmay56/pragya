import sys
import os
import json
import re
from datetime import datetime
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

# Clean MRPL Palette
MRPL_BURGUNDY = RGBColor(92, 40, 23)     # #5C2817
MRPL_DARK_GRAY = RGBColor(35, 31, 28)    # #231F1C
MRPL_MUTED_GRAY = RGBColor(115, 107, 98) # #736B62
MRPL_BURGUNDY_HEX = "5C2817"
MRPL_LIGHT_BG = "FBF9F6"
MRPL_BORDER_HEX = "E0D7CC"

def set_cell_background(cell, hex_color):
    """Set background color of a table cell."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tc_pr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    """Set cell padding in twips."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tc_pr.append(tc_mar)

def set_table_borders(table, color=MRPL_BORDER_HEX):
    """Apply clean subtle borders to a table."""
    tbl_pr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tbl_pr.append(borders)

def add_centered_light_watermark(header, watermark_text="MRPL CONFIDENTIAL"):
    """
    Injects a very light, perfectly centered diagonal watermark in the background of the page.
    """
    p = header.paragraphs[0]
    watermark_xml = f'''
    <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
         xmlns:v="urn:schemas-microsoft-com:vml"
         xmlns:o="urn:schemas-microsoft-com:office:office">
      <w:pPr>
        <w:pStyle w:val="Header"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:noProof/>
        </w:rPr>
        <w:pict>
          <v:shapetype id="_x0000_t136" coordsize="21600,21600" o:spt="136" adj="10800" path="m@7,l@8,m@5,21600l@6,21600e">
            <v:formulas>
              <v:f eqn="val #0"/>
              <v:f eqn="prod #0 4 3"/>
              <v:f eqn="prod #0 2 1"/>
              <v:f eqn="sum 21600 0 @1"/>
              <v:f eqn="sum 21600 0 #0"/>
              <v:f eqn="prod #0 1 2"/>
              <v:f eqn="prod @2 1 2"/>
              <v:f eqn="sum @3 0 @4"/>
              <v:f eqn="sum 21600 0 @6"/>
            </v:formulas>
            <v:path textpathok="t" o:connecttype="rect"/>
            <v:textpath on="t" fitshape="t"/>
            <v:handles>
              <v:h position="#0,bottomRight" xrange="6629,14971"/>
            </v:handles>
            <o:lock v:ext="edit" text="t" shapetype="t"/>
          </v:shapetype>
          <v:shape id="CenterLightWatermark" type="#_x0000_t136" 
                   style="position:absolute;left:0;top:0;width:500pt;height:110pt;z-index:-251656704;mso-position-horizontal:center;mso-position-horizontal-relative:page;mso-position-vertical:center;mso-position-vertical-relative:page;rotation:-45" 
                   fillcolor="#d9cfcc" stroked="f">
            <v:fill opacity="0.14"/>
            <v:textpath style="font-family:'Calibri', 'Arial', sans-serif;font-weight:bold;font-size:38pt" string="{watermark_text}"/>
          </v:shape>
        </w:pict>
      </w:r>
    </w:p>
    '''
    watermark_elem = parse_xml(watermark_xml)
    p._p.getparent().replace(p._p, watermark_elem)

def add_simple_header(doc):
    """Adds a clean, non-complex MRPL header banner."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)

    r_org = p.add_run("MANGALORE REFINERY AND PETROCHEMICALS LIMITED (MRPL)\n")
    r_org.font.name = "Arial"
    r_org.font.size = Pt(13)
    r_org.font.bold = True
    r_org.font.color.rgb = MRPL_BURGUNDY

    r_sub = p.add_run("A Subsidiary of ONGC · Sovereign AI Workbench Deliverable")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(9)
    r_sub.font.color.rgb = MRPL_MUTED_GRAY

    # Clean Divider Line
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.rows[0].cells[0]
    cell.width = Inches(6.8)
    set_cell_background(cell, MRPL_BURGUNDY_HEX)
    cell.paragraphs[0].paragraph_format.space_before = Pt(0)
    cell.paragraphs[0].paragraph_format.space_after = Pt(0)
    r_line = cell.paragraphs[0].add_run(" ")
    r_line.font.size = Pt(1.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def add_simple_info_card(doc, title, metadata):
    """
    Adds a simple, clean metadata table showing Name, Time, Use/Purpose, Author, and Classification.
    """
    doc_name = title or "MRPL Technical Deliverable"
    user_name = metadata.get("author") or metadata.get("user") or "Refinery Engineer / Chinmay"
    gen_time = metadata.get("date") or datetime.now().strftime("%d %b %Y, %I:%M %p")
    purpose_use = metadata.get("use") or metadata.get("unit") or "Engineering Assessment & Operational Documentation"
    classification = metadata.get("classification") or "MRPL Confidential"

    table = doc.add_table(rows=3, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table, color=MRPL_BORDER_HEX)

    col_widths = [Inches(3.4), Inches(3.4)]

    # Row 1: Document Name & Date/Time
    c00 = table.cell(0, 0)
    c01 = table.cell(0, 1)
    set_cell_background(c00, MRPL_LIGHT_BG)
    set_cell_background(c01, MRPL_LIGHT_BG)
    set_cell_margins(c00, top=70, bottom=70, left=100, right=100)
    set_cell_margins(c01, top=70, bottom=70, left=100, right=100)

    p00 = c00.paragraphs[0]
    p00.paragraph_format.space_after = Pt(1)
    r = p00.add_run("DOCUMENT NAME: ")
    r.font.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = MRPL_MUTED_GRAY
    r2 = p00.add_run(doc_name)
    r2.font.bold = True
    r2.font.size = Pt(9.5)
    r2.font.color.rgb = MRPL_BURGUNDY

    p01 = c01.paragraphs[0]
    p01.paragraph_format.space_after = Pt(1)
    r = p01.add_run("DATE & TIME: ")
    r.font.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = MRPL_MUTED_GRAY
    r2 = p01.add_run(gen_time)
    r2.font.size = Pt(9)
    r2.font.color.rgb = MRPL_DARK_GRAY

    # Row 2: User Name & Purpose / Use
    c10 = table.cell(1, 0)
    c11 = table.cell(1, 1)
    set_cell_background(c10, "FFFFFF")
    set_cell_background(c11, "FFFFFF")
    set_cell_margins(c10, top=70, bottom=70, left=100, right=100)
    set_cell_margins(c11, top=70, bottom=70, left=100, right=100)

    p10 = c10.paragraphs[0]
    p10.paragraph_format.space_after = Pt(1)
    r = p10.add_run("USER / AUTHOR: ")
    r.font.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = MRPL_MUTED_GRAY
    r2 = p10.add_run(user_name)
    r2.font.size = Pt(9)
    r2.font.color.rgb = MRPL_DARK_GRAY

    p11 = c11.paragraphs[0]
    p11.paragraph_format.space_after = Pt(1)
    r = p11.add_run("PURPOSE / USE: ")
    r.font.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = MRPL_MUTED_GRAY
    r2 = p11.add_run(purpose_use)
    r2.font.size = Pt(9)
    r2.font.color.rgb = MRPL_DARK_GRAY

    # Row 3: Security Classification & Environment
    c20 = table.cell(2, 0)
    c21 = table.cell(2, 1)
    set_cell_background(c20, MRPL_LIGHT_BG)
    set_cell_background(c21, MRPL_LIGHT_BG)
    set_cell_margins(c20, top=70, bottom=70, left=100, right=100)
    set_cell_margins(c21, top=70, bottom=70, left=100, right=100)

    p20 = c20.paragraphs[0]
    p20.paragraph_format.space_after = Pt(1)
    r = p20.add_run("CLASSIFICATION: ")
    r.font.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = MRPL_MUTED_GRAY
    r2 = p20.add_run(classification)
    r2.font.bold = True
    r2.font.size = Pt(9)
    r2.font.color.rgb = RGBColor(180, 40, 30)

    p21 = c21.paragraphs[0]
    p21.paragraph_format.space_after = Pt(1)
    r = p21.add_run("ENVIRONMENT: ")
    r.font.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = MRPL_MUTED_GRAY
    r2 = p21.add_run("Air-Gapped Sovereign AI (0% Cloud Egress)")
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = MRPL_MUTED_GRAY

    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = col_widths[idx]

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

def add_formatted_inline_runs(paragraph, text, default_color=MRPL_DARK_GRAY, default_size=Pt(10)):
    """Parses markdown bold and code formatting."""
    tokens = re.split(r'(\*\*.*?\*\*|`.*?`)', text)
    for token in tokens:
        if not token:
            continue
        if token.startswith('**') and token.endswith('**') and len(token) >= 4:
            clean_text = token[2:-2]
            r = paragraph.add_run(clean_text)
            r.font.bold = True
            r.font.size = default_size
            r.font.color.rgb = default_color
        elif token.startswith('`') and token.endswith('`') and len(token) >= 2:
            clean_text = token[1:-1]
            r = paragraph.add_run(clean_text)
            r.font.name = "Consolas"
            r.font.size = Pt(9)
            r.font.color.rgb = MRPL_BURGUNDY
        else:
            r = paragraph.add_run(token)
            r.font.size = default_size
            r.font.color.rgb = default_color

def clean_markdown_for_docx(text: str) -> str:
    """
    Strips out prompt echoes, 'Query Analyzed', 'Document Analyzed', 
    and backend system preambles so only the pure generated report remains in the Word file.
    """
    if not text:
        return ""
    
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        trimmed = line.strip()
        # Filter out query echoes, prompt repeats, and task preambles
        if re.match(r'^\*{0,2}(Query Analyzed|Document Analyzed|User Query|Prompt Analyzed|Query|Task Prompt|User Prompt):\*{0,2}', trimmed, re.I):
            continue
        if re.match(r'^#+\s*(MRPL Engineering Assessment & Sovereign AI Findings|MRPL Process Review & Engineering Assessment|Sovereign AI Assessment)$', trimmed, re.I):
            continue
        if re.match(r'^(Analyzed technical parameters for|Context:|Authorized MRPL Reference)', trimmed, re.I):
            continue
        cleaned_lines.append(line)
        
    return '\n'.join(cleaned_lines).strip()

def parse_and_add_markdown_content(doc, markdown_text):
    """
    Parses clean markdown into readable, simple Word content.
    """
    cleaned_content = clean_markdown_for_docx(markdown_text)
    lines = cleaned_content.split('\n')
    i = 0
    table_lines = []

    def flush_table():
        nonlocal table_lines
        if not table_lines:
            return
        rows = []
        for line in table_lines:
            line_str = line.strip()
            if not line_str or set(line_str.replace('|', '').replace('-', '').replace(':', '').strip()) == set():
                continue
            cells = [c.strip() for c in line_str.strip('|').split('|')]
            if cells:
                rows.append(cells)

        if rows:
            max_cols = max(len(r) for r in rows)
            for r in rows:
                while len(r) < max_cols:
                    r.append("")

            table = doc.add_table(rows=len(rows), cols=max_cols)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            set_table_borders(table, color=MRPL_BORDER_HEX)

            for r_idx, row_data in enumerate(rows):
                row = table.rows[r_idx]
                is_header = (r_idx == 0)
                for c_idx, cell_val in enumerate(row_data):
                    cell = row.cells[c_idx]
                    set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
                    p = cell.paragraphs[0]
                    p.paragraph_format.space_before = Pt(1)
                    p.paragraph_format.space_after = Pt(1)

                    if is_header:
                        set_cell_background(cell, MRPL_BURGUNDY_HEX)
                        clean_header = cell_val.replace('**', '').strip()
                        r = p.add_run(clean_header)
                        r.font.bold = True
                        r.font.size = Pt(9)
                        r.font.color.rgb = RGBColor(255, 255, 255)
                    else:
                        bg_col = "FBF9F6" if (r_idx % 2 == 1) else "FFFFFF"
                        set_cell_background(cell, bg_col)
                        add_formatted_inline_runs(p, cell_val, default_color=MRPL_DARK_GRAY, default_size=Pt(9))

            doc.add_paragraph().paragraph_format.space_after = Pt(6)

        table_lines = []

    while i < len(lines):
        raw_line = lines[i]
        line = raw_line.strip()

        if line.startswith('|') and line.endswith('|'):
            table_lines.append(line)
            i += 1
            continue
        elif table_lines:
            flush_table()

        if not line:
            i += 1
            continue

        # Heading 1
        if line.startswith('# '):
            h_text = line[2:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.keep_with_next = True
            r = p.add_run(h_text)
            r.font.name = "Arial"
            r.font.size = Pt(14)
            r.font.bold = True
            r.font.color.rgb = MRPL_BURGUNDY

        # Heading 2
        elif line.startswith('## '):
            h_text = line[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            r = p.add_run(h_text)
            r.font.name = "Arial"
            r.font.size = Pt(12)
            r.font.bold = True
            r.font.color.rgb = MRPL_BURGUNDY

        # Heading 3
        elif line.startswith('### '):
            h_text = line[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            r = p.add_run(h_text)
            r.font.name = "Arial"
            r.font.size = Pt(10.5)
            r.font.bold = True
            r.font.color.rgb = MRPL_BURGUNDY

        # Blockquote / Note (> text)
        elif line.startswith('> '):
            quote_text = line[2:].strip()
            table = doc.add_table(rows=1, cols=1)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            cell = table.rows[0].cells[0]
            cell.width = Inches(6.8)
            set_cell_background(cell, MRPL_LIGHT_BG)
            set_cell_margins(cell, top=80, bottom=80, left=140, right=100)

            tc_pr = cell._tc.get_or_add_tcPr()
            borders = parse_xml(
                f'<w:tcBorders {nsdecls("w")}>'
                f'<w:left w:val="single" w:sz="18" w:space="0" w:color="{MRPL_BURGUNDY_HEX}"/>'
                f'<w:top w:val="none"/>'
                f'<w:bottom w:val="none"/>'
                f'<w:right w:val="none"/>'
                f'</w:tcBorders>'
            )
            tc_pr.append(borders)

            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            add_formatted_inline_runs(p, quote_text, default_color=MRPL_BURGUNDY, default_size=Pt(9.5))

            doc.add_paragraph().paragraph_format.space_after = Pt(4)

        # Bullet lists
        elif line.startswith('- ') or line.startswith('* ') or line.startswith('• '):
            item_text = line[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            add_formatted_inline_runs(p, item_text, default_color=MRPL_DARK_GRAY, default_size=Pt(9.5))

        # Numbered lists
        elif re.match(r'^\d+\.\s', line):
            item_text = re.sub(r'^\d+\.\s', '', line).strip()
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            add_formatted_inline_runs(p, item_text, default_color=MRPL_DARK_GRAY, default_size=Pt(9.5))

        # Regular Paragraph
        else:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            add_formatted_inline_runs(p, line, default_color=MRPL_DARK_GRAY, default_size=Pt(9.5))

        i += 1

    if table_lines:
        flush_table()

def setup_simple_footer(doc):
    """Sets up a clean footer."""
    section = doc.sections[0]
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run("MRPL Sovereign AI Workbench · Air-Gapped Confidential")
    r.font.size = Pt(8)
    r.font.color.rgb = MRPL_MUTED_GRAY

def generate_mrpl_docx(output_path, title, markdown_content, metadata=None, watermark="MRPL CONFIDENTIAL"):
    """
    Generates a simple, clean, professional MRPL Word Document with a light, centered watermark.
    """
    if metadata is None:
        metadata = {}

    doc = docx.Document()

    # Standard Margins (0.75 in)
    section = doc.sections[0]
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(0.75)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

    # 1. Light, Centered Watermark
    add_centered_light_watermark(section.header, watermark_text=watermark)

    # 2. Simple Footer
    setup_simple_footer(doc)

    # 3. Simple Header
    add_simple_header(doc)

    # 4. Simple Name, Time, User, Use Info Box
    add_simple_info_card(doc, title, metadata)

    # 5. Document Content
    parse_and_add_markdown_content(doc, markdown_content)

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    doc.save(output_path)
    return output_path

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python generate_docx.py <input_json_path_or_json_string> [output_docx_path]"}))
        sys.exit(1)

    input_arg = sys.argv[1]
    output_docx_path = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        if os.path.exists(input_arg):
            with open(input_arg, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = json.loads(input_arg)
    except Exception as e:
        print(json.dumps({"error": f"Failed to parse input JSON: {str(e)}"}))
        sys.exit(1)

    title = data.get("title", "MRPL Technical Report")
    content = data.get("content", "# Technical Summary\nNo content provided.")
    metadata = data.get("metadata", {})
    watermark = data.get("watermark", "MRPL CONFIDENTIAL")

    if not output_docx_path:
        output_docx_path = data.get("outputPath")

    if not output_docx_path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_docx_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "..", "uploads",
            f"MRPL_Deliverable_{timestamp}.docx"
        )

    try:
        final_path = generate_mrpl_docx(output_docx_path, title, content, metadata, watermark)
        print(json.dumps({
            "success": True,
            "outputPath": os.path.abspath(final_path),
            "filename": os.path.basename(final_path),
            "sizeBytes": os.path.getsize(final_path),
            "title": title
        }))
    except Exception as e:
        import traceback
        print(json.dumps({
            "error": str(e),
            "traceback": traceback.format_exc()
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
