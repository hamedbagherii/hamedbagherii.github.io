from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from pathlib import Path

OUT = Path(__file__).with_name('Hamed-Bagheri-Portfolio-Typography-Color-Spec.docx')
NAVY = '0A0F16'
NAVY2 = '0D131B'
AMBER = 'F0A557'
AMBER_HOT = 'FF9D3A'
INK = '25313C'
SOFT = '65717C'
LIGHT = 'F4F6F8'
PALE = 'F5F7F8'
LINE = 'D9DEE2'
WHITE = 'FFFFFF'

def rgb(hexv):
    return RGBColor.from_string(hexv)

def font(run, name='Arial', size=10, color=INK, bold=False, italic=False):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn('w:ascii'), name)
    run._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'), name)
    run.font.size = Pt(size)
    run.font.color.rgb = rgb(color)
    run.bold = bold
    run.italic = italic

def shade(cell, color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = tcPr.find(qn('w:shd'))
    if shd is None:
        shd = OxmlElement('w:shd'); tcPr.append(shd)
    shd.set(qn('w:fill'), color)

def margins(cell, top=90, start=120, bottom=90, end=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = tcPr.first_child_found_in('w:tcMar')
    if tcMar is None:
        tcMar = OxmlElement('w:tcMar'); tcPr.append(tcMar)
    for edge, value in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        node = tcMar.find(qn('w:'+edge))
        if node is None: node=OxmlElement('w:'+edge); tcMar.append(node)
        node.set(qn('w:w'), str(value)); node.set(qn('w:type'),'dxa')

def borders(table, color=LINE, size='6'):
    tblPr = table._tbl.tblPr
    el = tblPr.find(qn('w:tblBorders'))
    if el is None: el=OxmlElement('w:tblBorders'); tblPr.append(el)
    for edge in ('top','left','bottom','right','insideH','insideV'):
        e=OxmlElement('w:'+edge); e.set(qn('w:val'),'single'); e.set(qn('w:sz'),size); e.set(qn('w:color'),color); el.append(e)

def set_cell_width(cell, dxa):
    tcPr=cell._tc.get_or_add_tcPr(); tcW=tcPr.find(qn('w:tcW'))
    if tcW is None: tcW=OxmlElement('w:tcW'); tcPr.append(tcW)
    tcW.set(qn('w:w'),str(dxa)); tcW.set(qn('w:type'),'dxa')

def table_geometry(table, widths, indent=130):
    table.autofit = False
    tblPr = table._tbl.tblPr
    tblW = tblPr.find(qn('w:tblW'))
    if tblW is None: tblW=OxmlElement('w:tblW'); tblPr.append(tblW)
    tblW.set(qn('w:w'),str(sum(widths))); tblW.set(qn('w:type'),'dxa')
    tblInd = tblPr.find(qn('w:tblInd'))
    if tblInd is None: tblInd=OxmlElement('w:tblInd'); tblPr.append(tblInd)
    tblInd.set(qn('w:w'),str(indent)); tblInd.set(qn('w:type'),'dxa')
    layout = tblPr.find(qn('w:tblLayout'))
    if layout is None: layout=OxmlElement('w:tblLayout'); tblPr.append(layout)
    layout.set(qn('w:type'),'fixed')
    grid = table._tbl.tblGrid
    for child in list(grid): grid.remove(child)
    for width in widths:
        col=OxmlElement('w:gridCol'); col.set(qn('w:w'),str(width)); grid.append(col)
    for row in table.rows:
        for cell,width in zip(row.cells,widths): set_cell_width(cell,width)

def add_heading(doc, text, level=1):
    p=doc.add_paragraph(style=f'Heading {level}')
    p.paragraph_format.keep_with_next=True
    r=p.add_run(text)
    return p

def add_note(doc, label, text):
    t=doc.add_table(rows=1, cols=1); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False
    table_geometry(t,[9360],180); shade(t.cell(0,0),'FFF5E9'); margins(t.cell(0,0),140,180,140,180)
    borders(t,'F2C58F','6')
    t.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))
    p=t.cell(0,0).paragraphs[0]; p.paragraph_format.space_after=Pt(0); p.paragraph_format.line_spacing=1.15
    a=p.add_run(label.upper()+'  '); font(a,'Arial',9,AMBER_HOT,True)
    b=p.add_run(text); font(b,'Arial',9.5,INK)
    doc.add_paragraph().paragraph_format.space_after=Pt(1)

def add_spec_table(doc, rows):
    table=doc.add_table(rows=1, cols=4)
    table.alignment=WD_TABLE_ALIGNMENT.CENTER; table.autofit=False
    widths=[2450,1550,2200,3160]
    table_geometry(table,widths)
    headers=['Element','Font role','Size','Text color']
    for i,h in enumerate(headers):
        c=table.rows[0].cells[i]; set_cell_width(c,widths[i]); shade(c,NAVY); margins(c,110,130,110,130); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(0); r=p.add_run(h.upper()); font(r,'Arial',8.5,WHITE,True)
    for n,row in enumerate(rows):
        cells=table.add_row().cells
        for i,val in enumerate(row):
            c=cells[i]; set_cell_width(c,widths[i]); margins(c,100,130,100,130); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if n%2: shade(c,PALE)
            p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(0); p.paragraph_format.line_spacing=1.08
            r=p.add_run(val); font(r,'IBM Plex Mono' if i in (1,2,3) else 'Arial',8.6,INK,bold=(i==0))
    borders(table)
    table.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))
    doc.add_paragraph().paragraph_format.space_after=Pt(2)

def footer(section):
    p=section.footer.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    r=p.add_run('HAMED BAGHERI  /  PORTFOLIO TYPOGRAPHY & COLOR SPEC'); font(r,'IBM Plex Mono',7.5,SOFT,True)

doc=Document()
sec=doc.sections[0]
sec.top_margin=Inches(.72); sec.bottom_margin=Inches(.7); sec.left_margin=Inches(.78); sec.right_margin=Inches(.78)
sec.header_distance=Inches(.34); sec.footer_distance=Inches(.35)
footer(sec)

styles=doc.styles
normal=styles['Normal']; normal.font.name='Arial'; normal._element.rPr.rFonts.set(qn('w:ascii'),'Arial'); normal._element.rPr.rFonts.set(qn('w:hAnsi'),'Arial'); normal.font.size=Pt(10); normal.font.color.rgb=rgb(INK)
normal.paragraph_format.space_after=Pt(6); normal.paragraph_format.line_spacing=1.18
for name,size,color,before,after in [('Heading 1',17,NAVY,14,7),('Heading 2',12.5,AMBER_HOT,10,5),('Heading 3',10.5,NAVY2,8,4)]:
    s=styles[name]; s.font.name='Arial'; s._element.rPr.rFonts.set(qn('w:ascii'),'Arial'); s._element.rPr.rFonts.set(qn('w:hAnsi'),'Arial'); s.font.size=Pt(size); s.font.bold=True; s.font.color.rgb=rgb(color); s.paragraph_format.space_before=Pt(before); s.paragraph_format.space_after=Pt(after); s.paragraph_format.keep_with_next=True

# Cover
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.LEFT; p.paragraph_format.space_before=Pt(44); p.paragraph_format.space_after=Pt(10)
r=p.add_run('DESIGN SYSTEM REFERENCE'); font(r,'IBM Plex Mono',9,AMBER_HOT,True)
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(8)
r=p.add_run('Portfolio Typography\n& Text Color Specification'); font(r,'Arial',28,NAVY,True)
p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(24)
r=p.add_run('Hamed Bagheri - Robotics Electronics Engineering Portfolio'); font(r,'Arial',12,SOFT)

t=doc.add_table(rows=1,cols=4); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False
table_geometry(t,[2340,2340,2340,2340])
t.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))
for i,(label,value,color) in enumerate([('PRIMARY BG','#0A0F16',NAVY),('ALT BG','#0D131B',NAVY2),('ACCENT','#F0A557',AMBER),('ACTIVE','#FF9D3A',AMBER_HOT)]):
    c=t.cell(0,i); set_cell_width(c,2340); shade(c,color); margins(c,140,130,140,130)
    p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(2); a=p.add_run(label+'\n'); font(a,'IBM Plex Mono',7.5,WHITE,True); b=p.add_run(value); font(b,'IBM Plex Mono',9,WHITE,True)
doc.add_paragraph().paragraph_format.space_after=Pt(8)

add_heading(doc,'Purpose',1)
p=doc.add_paragraph('A practical reference for maintaining consistent typography, hierarchy, and text color across the portfolio. Values reflect the current intended CSS system after responsive overrides.')
p.paragraph_format.space_after=Pt(10)
add_note(doc,'Responsive sizing','Ranges such as 54–78 px are implemented with CSS clamp(). The browser selects a value inside the range according to viewport and available layout width.')
add_heading(doc,'Core font system',1)
add_spec_table(doc,[
    ('Display and major headings','Inter / Helvetica Neue / Arial','Variable by role','#F4F6F8 or #E7EAE7'),
    ('Technical labels and metadata','IBM Plex Mono / Roboto Mono','6.5–14 px','#4D554F to #858D87'),
    ('Interactive emphasis','Role-dependent','Inherited','#F0A557 or #FF9D3A'),
])
add_note(doc,'Implementation note','Space Grotesk is referenced by a small Honors & Awards override but is not explicitly loaded. Standardizing it to Inter—or loading Space Grotesk intentionally—will eliminate browser-dependent fallback differences.')

doc.add_page_break()
add_heading(doc,'01  Header and Hero',1)
add_heading(doc,'Header',2)
add_spec_table(doc,[
('Brand name','IBM Plex Mono','14 px','#AAB0AC'),('Navigation','IBM Plex Mono','13–14 px','#777F79'),('Navigation — active / hover','IBM Plex Mono','13–14 px','#E7EAE7'),('Contact button','IBM Plex Mono','14 px','#E7EAE7; hover #0A0F16 on #FF9D3A')])
add_heading(doc,'Hero',2)
add_spec_table(doc,[
('System line','IBM Plex Mono','12.5 px','#F0A557'),('Kicker','IBM Plex Mono','12 px','#69716B'),('Main headline','Inter','54–78 px desktop','#F4F6F8'),('Highlighted headline','Inter','Same as headline','Gradient #F0A557 → #FFAD55 → #F4C083'),('Introduction','IBM Plex Mono','15.5 px','#9AA6B2'),('Introduction link','IBM Plex Mono','15.5 px','#F0A557'),('Primary action','IBM Plex Mono','14 px','#0A0F16 on #FF9D3A'),('Secondary action','IBM Plex Mono','14 px','#E7EAE7'),('Portrait HUD','IBM Plex Mono','11–12 px','#E1E7E1 / #FF9D3A'),('Metric value','IBM Plex Mono','19–27 px','#DFE4DF'),('Metric description','Inter','16 px','#737C75')])
add_heading(doc,'Hero headline breakpoints',2)
add_spec_table(doc,[('Wide desktop','Inter','54–78 px','#F4F6F8'),('1221–1380 px viewport','Inter','50–56 px','#F4F6F8'),('701–1220 px viewport','Inter','52–72 px','#F4F6F8'),('Mobile ≤700 px','Inter','42–62 px','#F4F6F8')])

doc.add_page_break()
add_heading(doc,'02  Section Framework and About',1)
add_heading(doc,'Section headings',2)
add_spec_table(doc,[('Section number','IBM Plex Mono','30 px','#FF9D3A'),('Section metadata','IBM Plex Mono','12 px','#607067'),('Section title','Inter','27–34 px','#DFE3DF'),('Compact horizontal title','IBM Plex Mono','15 px','#DFE3DF')])
add_heading(doc,'About',2)
add_spec_table(doc,[('Lead statement','Inter','27–44 px','#D8DDD8'),('Highlighted words','Inter','Same as lead','#FF9D3A'),('Supporting paragraphs','Inter','20–24 px','#8F9791'),('Dossier labels','IBM Plex Mono','12 px','#69716B'),('Dossier values','Inter','17 px','#B8BDB9'),('Status metadata','IBM Plex Mono','12 px','#FF9D3A')])
add_heading(doc,'Mobile adjustments',2)
add_spec_table(doc,[('About lead','Inter','30 px','#D8DDD8'),('About paragraphs','Inter','19 px','#8F9791')])

doc.add_page_break()
add_heading(doc,'03  Projects, Media, and Experience',1)
add_heading(doc,'Projects',2)
add_spec_table(doc,[('Project status','IBM Plex Mono','13 px','#FF9D3A'),('Organization and dates','IBM Plex Mono','13 px','#5F6861'),('Project title','Inter','28–43 px','#E0E5E0'),('Description','Inter','19 px','#8F9691'),('Capability tags','IBM Plex Mono','10–12 px','#858D87'),('Gallery title','Inter','≈18 px','#EEF1EE'),('Gallery description','Inter','12–13 px','#8F9791'),('Gallery metadata','IBM Plex Mono','9–10 px','#FF9D3A')])
add_heading(doc,'Video sections',2)
add_spec_table(doc,[('Section metadata','IBM Plex Mono','9–10 px','#FF9D3A'),('Featured title','Inter','18 px','#F0F3F0'),('Featured description','Inter','12 px','#8F9891'),('Selector category','IBM Plex Mono','9 px','#FF9D3A'),('Selector title','Inter','≈15 px','#EDF1F5'),('Selector description','Inter','≈13 px','#9099A2'),('Duration','IBM Plex Mono','9 px','Light neutral / amber')])
add_heading(doc,'Experience',2)
add_spec_table(doc,[('Date','IBM Plex Mono','13 px','#69716B'),('Role metadata','IBM Plex Mono','12 px','#FF9D3A or muted gray'),('Role title','Inter','23–29 px','#DDE1DE'),('Description','IBM Plex Mono','18 px','#8F9892'),('Mobile role title','Inter','21 px','#DDE1DE'),('Mobile description','IBM Plex Mono','16 px','#8F9892')])

doc.add_page_break()
add_heading(doc,'04  Expertise and Honors',1)
add_heading(doc,'Technical Expertise',2)
add_spec_table(doc,[('Card number','IBM Plex Mono','12 px','#69716B'),('Card category','IBM Plex Mono','12 px','#FF9D3A'),('Card title','Inter','24 px','#D5DAD6'),('Capability items','IBM Plex Mono','14 px','#69716B'),('List marker','—','—','#FF9D3A')])
add_heading(doc,'Honors & Awards',2)
add_spec_table(doc,[('Section title','Inter / fallback','27–34 px','#DFE3DF'),('Introductory copy','IBM Plex Mono','12.5–14 px','#7A8592'),('Summary number','Inter','26 px','#F0A557'),('Summary label','IBM Plex Mono','11.5 px','#7A8592'),('Year','Inter','16 px','#F0A557'),('Competition name','IBM Plex Mono','13.5 px','#DBE2E8'),('Result badge','IBM Plex Mono','12 px','#0A0F16 on #F0A557'),('Award label','IBM Plex Mono','10 px','#5C6773'),('Award tag','IBM Plex Mono','11 px','#E0A866'),('Certificate eyebrow','IBM Plex Mono','6.5 px','#69736C'),('Certificate title','IBM Plex Mono','8 px','#9AA39C; hover #E7EAE7'),('Certificate action arrow','IBM Plex Mono','10 px','#FF9D3A')])

doc.add_page_break()
add_heading(doc,'05  Publications, Education, and Contact',1)
add_heading(doc,'Publications',2)
add_spec_table(doc,[('Year','IBM Plex Mono','13 px','#FF9D3A'),('Paper title','Inter','19–24 px','#DCE1DD'),('Authors','Inter','14 px','#8F9992'),('Highlighted author name','Inter','14 px','#D6DCD7'),('Venue','IBM Plex Mono','10 px','#FF9D3A'),('Supporting metadata','IBM Plex Mono','10–12 px','#69716B')])
add_heading(doc,'Education',2)
add_spec_table(doc,[('Degree title','Inter','20–25 px','#DCE1DC'),('Institution / details','IBM Plex Mono','16 px','#929C95'),('Metadata label','IBM Plex Mono','10–13 px','#69746C'),('Dates / accent','IBM Plex Mono','12–13 px','#FF9D3A or muted gray')])
add_heading(doc,'Contact and Footer',2)
add_spec_table(doc,[('Technical label','IBM Plex Mono','12 px','#FF9D3A'),('Main heading','Inter','50–92 px','#E6EAE6'),('Mobile main heading','Inter','47–72 px','#E6EAE6'),('Description','Inter','18–20 px','#8B938D'),('Links / actions','IBM Plex Mono','12–14 px','#E7EAE7'),('Contact metadata','IBM Plex Mono','12 px','#4F5751'),('Footer','IBM Plex Mono','11 px','#69716B')])

add_heading(doc,'Color hierarchy summary',1)
add_spec_table(doc,[('Important headings','Inter','#F4F6F8 / #E7EAE7','High contrast'),('Readable descriptions','Inter / mono','#8B98A5 / #8F9791','Secondary hierarchy'),('Technical metadata','IBM Plex Mono','#69716B / #4D554F','Low emphasis'),('Emphasis and interaction','Role-dependent','#F0A557 / #FF9D3A','Amber accent only')])

# keep rows together where possible and add document properties
doc.core_properties.title='Portfolio Typography and Text Color Specification'
doc.core_properties.subject='Design system reference for hamedbagheri.github.io'
doc.core_properties.author='Hamed Bagheri'
doc.save(OUT)
print(OUT)
