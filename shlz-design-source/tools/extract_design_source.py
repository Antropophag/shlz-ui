from pathlib import Path
from lxml import etree
from collections import Counter, defaultdict
import hashlib, json, re, csv, math, os, shutil, zipfile, base64

SRC=Path('/mnt/data/svg-src-extracted')
OUT=Path('/mnt/data/shlz-design-source')
if OUT.exists(): shutil.rmtree(OUT)
for d in ['inventory','tokens','geometry','components','layouts','duplicates','assets','assets/icons','assets/file-types','source-map','reports','catalog','tools']:
    (OUT/d).mkdir(parents=True, exist_ok=True)

# reuse previously extracted vector assets only as derivative artifacts; all metadata below is rescanned from source
prevzip=Path('/mnt/data/shlz-ui-v0.5.0.zip')
if prevzip.exists():
    with zipfile.ZipFile(prevzip) as z:
        for info in z.infolist():
            n=info.filename
            if '/icons/core/' in n and not n.endswith('/'):
                dest=OUT/'assets/icons'/Path(n).name
                dest.write_bytes(z.read(info))
            elif '/icons/file-types/' in n and not n.endswith('/'):
                dest=OUT/'assets/file-types'/Path(n).name
                dest.write_bytes(z.read(info))
            elif n.endswith('/icons/manifest.json'):
                (OUT/'assets/icon-manifest.json').write_bytes(z.read(info))

component_names = {
'Tabs.svg','Date-Picker.svg','Icons.svg','Modal.svg','Checkbox.svg','Bage.svg','Tooltip.svg','Notification.svg','Table.svg','Segment.svg','Cover.svg','Dropdown menu.svg','Popover.svg','Spacing.svg','Drawer.svg','Status.svg','Input Number.svg','Buttons.svg','Tag.svg','Pagination (1).svg','Colors.svg','Textarea.svg','Table Cell.svg','Pagination.svg','Select.svg','Radio.svg','Reports card.svg','Avatar.svg','Header.svg','Pagination (2).svg','Link.svg','Card with button.svg','Sidebar.svg','Switch.svg'
}

def decode_figma_name(name:str)->str:
    def repl(m):
        try:return chr(int(m.group(1),16))
        except:return m.group(0)
    return re.sub(r'#U([0-9A-Fa-f]{4,6})', repl, name)

def num(v):
    if v is None:return None
    m=re.match(r'^\s*(-?\d+(?:\.\d+)?)',str(v))
    return float(m.group(1)) if m else None

def norm_num(v):
    if v is None:return None
    if abs(v-round(v))<1e-9:return int(round(v))
    return round(v,4)

def sha(b): return hashlib.sha256(b).hexdigest()

def color_norm(v):
    if not v:return None
    v=v.strip()
    if v.lower() in ('none','transparent'): return v.lower()
    if re.fullmatch(r'#[0-9A-Fa-f]{3,8}',v): return v.upper()
    if v.lower() in ('white','black'): return {'white':'#FFFFFF','black':'#000000'}[v.lower()]
    return v

files=sorted(SRC.glob('*.svg'))
inventory=[]
global_tags=Counter(); colors=Counter(); color_files=defaultdict(Counter)
fill_colors=Counter(); stroke_colors=Counter(); opacities=Counter(); fill_op=Counter(); stroke_op=Counter(); stroke_width=Counter(); rxvals=Counter(); ryvals=Counter(); radii=Counter()
rect_dims=Counter(); rect_widths=Counter(); rect_heights=Counter(); small_dims=Counter(); wide_heights=Counter(); screen_chrome_dims=Counter()
linecaps=Counter(); linejoins=Counter(); transforms=Counter(); filter_sigs=Counter(); gradient_sigs=Counter(); image_hashes=defaultdict(list)
path_hashes=defaultdict(lambda: {'count':0,'files':Counter(),'length':0})
component_fingerprints={}; file_styles={}; layout_metrics=[]; source_entries=[]
text_total=0; style_font_attrs=Counter(); id_total=0

for p in files:
    data=p.read_bytes(); root=etree.fromstring(data)
    rawname=p.name; decoded=decode_figma_name(rawname)
    width=num(root.get('width')); height=num(root.get('height')); viewBox=root.get('viewBox')
    kind='component-sheet' if rawname in component_names else 'screen-or-reference'
    tags=Counter(); fcolors=Counter(); fstrokes=Counter(); frects=Counter(); frx=Counter(); fop=Counter(); fstroke_w=Counter(); ffilters=Counter(); fgrad=Counter(); fsmall=Counter(); fwideh=Counter()
    images=[]; texts=0; ids=0; embedded_bytes=0
    # parse all elements
    for el in root.iter():
        tag=etree.QName(el).localname
        tags[tag]+=1; global_tags[tag]+=1
        if el.get('id'): ids+=1; id_total+=1
        if tag=='text': texts+=1; text_total+=1
        for fa in ['font-family','font-size','font-weight','font-style','letter-spacing']:
            if el.get(fa): style_font_attrs[(fa,el.get(fa))]+=1
        for attr,ctr,fctr in [('fill',fill_colors,fcolors),('stroke',stroke_colors,fstrokes)]:
            v=color_norm(el.get(attr))
            if v and not v.startswith('url('):
                ctr[v]+=1; fctr[v]+=1; colors[v]+=1; color_files[v][rawname]+=1
        for a,ctr in [('opacity',opacities),('fill-opacity',fill_op),('stroke-opacity',stroke_op)]:
            v=el.get(a)
            if v:
                try: ctr[str(norm_num(float(v)))]+=1; fop[(a,str(norm_num(float(v))))]+=1
                except: pass
        if el.get('stroke-width'):
            v=num(el.get('stroke-width'))
            if v is not None: stroke_width[norm_num(v)]+=1; fstroke_w[norm_num(v)]+=1
        if el.get('stroke-linecap'): linecaps[el.get('stroke-linecap')]+=1
        if el.get('stroke-linejoin'): linejoins[el.get('stroke-linejoin')]+=1
        if el.get('transform'):
            t=el.get('transform').split('(')[0]; transforms[t]+=1
        if tag=='rect':
            w=num(el.get('width')); h=num(el.get('height')); rx=num(el.get('rx')); ry=num(el.get('ry'))
            if w is not None and h is not None:
                key=(norm_num(w),norm_num(h)); rect_dims[key]+=1; frects[key]+=1
                rect_widths[norm_num(w)]+=1; rect_heights[norm_num(h)]+=1
                for v in [w,h]:
                    if 0 < v <= 64: small_dims[norm_num(v)]+=1; fsmall[norm_num(v)]+=1
                if w>=300 and h<=200 and h>0: wide_heights[norm_num(h)]+=1; fwideh[norm_num(h)]+=1
                if kind!='component-sheet' and ((w<=400 and h>=300) or (h<=120 and w>=500)):
                    screen_chrome_dims[key]+=1
            if rx is not None: rxvals[norm_num(rx)]+=1; frx[norm_num(rx)]+=1
            if ry is not None: ryvals[norm_num(ry)]+=1
        elif tag=='circle':
            r=num(el.get('r'))
            if r is not None:radii[norm_num(r)]+=1
        elif tag=='path':
            d=el.get('d')
            if d:
                hsh=sha(d.encode()); rec=path_hashes[hsh]; rec['count']+=1; rec['files'][rawname]+=1; rec['length']=len(d)
        elif tag=='image':
            href=el.get('{http://www.w3.org/1999/xlink}href') or el.get('href') or ''
            rec={'width':norm_num(num(el.get('width')) or 0),'height':norm_num(num(el.get('height')) or 0)}
            if href.startswith('data:'):
                head,_,payload=href.partition(','); mime=head[5:].split(';')[0]
                try:
                    b=base64.b64decode(payload); hh=sha(b); embedded_bytes+=len(b)
                    rec.update({'embedded':True,'mime':mime,'sha256':hh,'bytes':len(b)})
                    image_hashes[hh].append({'file':rawname,'mime':mime,'bytes':len(b)})
                    ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}.get(mime,'bin')
                    ap=OUT/'assets'/f'embedded-{hh[:16]}.{ext}'
                    if not ap.exists(): ap.write_bytes(b)
                except Exception as e: rec.update({'embedded':True,'error':str(e)})
            else: rec.update({'embedded':False,'href':href[:200]})
            images.append(rec)
    # filters and gradients canonicalized separately
    for el in root.xpath('.//*[local-name()="filter"]'):
        blob=etree.tostring(el,with_tail=False)
        # strip id only
        try:
            cp=etree.fromstring(blob); cp.attrib.pop('id',None); sig=sha(etree.tostring(cp))
        except: sig=sha(blob)
        filter_sigs[sig]+=1; ffilters[sig]+=1
    for el in root.xpath('.//*[local-name()="linearGradient" or local-name()="radialGradient"]'):
        cp=etree.fromstring(etree.tostring(el,with_tail=False)); cp.attrib.pop('id',None)
        sig=sha(etree.tostring(cp)); gradient_sigs[sig]+=1; fgrad[sig]+=1
    inv={
        'source_file':rawname,'decoded_name':decoded,'kind':kind,'bytes':len(data),'sha256':sha(data),
        'width':norm_num(width) if width is not None else None,'height':norm_num(height) if height is not None else None,'viewBox':viewBox,
        'tags':dict(tags),'element_count':sum(tags.values()),'id_count':ids,'text_element_count':texts,
        'embedded_images':images,'embedded_image_bytes':embedded_bytes
    }
    inventory.append(inv)
    file_styles[rawname]={
        'fills':dict(fcolors.most_common()),'strokes':dict(fstrokes.most_common()),
        'rect_dimensions':[{ 'width':k[0],'height':k[1],'count':v} for k,v in frects.most_common(100)],
        'radii':dict(frx.most_common()),'opacity_attributes':[{ 'attribute':k[0],'value':k[1],'count':v} for k,v in fop.most_common()],
        'stroke_widths':dict(fstroke_w.most_common()),'small_dimensions':dict(fsmall.most_common()),'wide_control_heights':dict(fwideh.most_common()),
        'filter_signatures':dict(ffilters),'gradient_signatures':dict(fgrad)
    }
    if kind=='component-sheet':
        fps=[]
        for (w,h),cnt in frects.most_common(80):
            # enumerate matching style combos by a second focused xpath pass for this dim
            combo=Counter()
            for el in root.xpath('.//*[local-name()="rect"]'):
                ew,eh=num(el.get('width')),num(el.get('height'))
                if ew is not None and eh is not None and norm_num(ew)==w and norm_num(eh)==h:
                    combo[(norm_num(num(el.get('rx')) or 0), color_norm(el.get('fill')),color_norm(el.get('stroke')),norm_num(num(el.get('stroke-width')) or 0),el.get('opacity'))]+=1
            fps.append({'width':w,'height':h,'count':cnt,'styles':[{'rx':c[0],'fill':c[1],'stroke':c[2],'stroke_width':c[3],'opacity':c[4],'count':n} for c,n in combo.most_common(12)]})
        component_fingerprints[rawname]={'decoded_name':decoded,'fingerprints':fps}
    else:
        layout_metrics.append({'source_file':rawname,'decoded_name':decoded,'canvas':{'width':norm_num(width or 0),'height':norm_num(height or 0)},'dominant_rect_dimensions':[{'width':k[0],'height':k[1],'count':v} for k,v in frects.most_common(40)],'small_dimensions':dict(fsmall.most_common(30)),'wide_control_heights':dict(fwideh.most_common(30))})

# outputs
(OUT/'inventory/source-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf-8')
with (OUT/'inventory/source-inventory.csv').open('w',newline='',encoding='utf-8-sig') as f:
    w=csv.writer(f); w.writerow(['source_file','decoded_name','kind','bytes','sha256','width','height','elements','paths','rects','groups','images','text_elements','embedded_image_bytes'])
    for x in inventory:
        t=x['tags']; w.writerow([x['source_file'],x['decoded_name'],x['kind'],x['bytes'],x['sha256'],x['width'],x['height'],x['element_count'],t.get('path',0),t.get('rect',0),t.get('g',0),t.get('image',0),x['text_element_count'],x['embedded_image_bytes']])

# token reports with evidence
color_out=[]
for c,n in colors.most_common():
    color_out.append({'value':c,'count':n,'fill_count':fill_colors[c],'stroke_count':stroke_colors[c],'files':[{'file':f,'count':cn} for f,cn in color_files[c].most_common()]})
(OUT/'tokens/colors-observed.json').write_text(json.dumps(color_out,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'tokens/opacity-observed.json').write_text(json.dumps({'opacity':dict(opacities.most_common()),'fill_opacity':dict(fill_op.most_common()),'stroke_opacity':dict(stroke_op.most_common())},indent=2),encoding='utf-8')
(OUT/'tokens/strokes-observed.json').write_text(json.dumps({'stroke_widths':dict(stroke_width.most_common()),'linecaps':dict(linecaps),'linejoins':dict(linejoins)},indent=2),encoding='utf-8')
(OUT/'tokens/radii-observed.json').write_text(json.dumps({'rect_rx':dict(rxvals.most_common()),'rect_ry':dict(ryvals.most_common()),'circle_r':dict(radii.most_common())},indent=2),encoding='utf-8')
# candidate spacing scale: rect dimensions 1..64, count >= 5; score favors integer and repetition across source
spacing=[{'value':k,'count':v} for k,v in small_dims.most_common() if v>=5]
(OUT/'tokens/spacing-candidates.json').write_text(json.dumps({'method':'Observed rect width/height values <=64px occurring >=5 times. These are candidates, not semantic Figma token names.','values':spacing},ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'tokens/typography-recoverability.json').write_text(json.dumps({'text_elements_total':text_total,'font_attributes_observed':[{'attribute':k[0],'value':k[1],'count':v} for k,v in style_font_attrs.most_common()],'conclusion':'Typography names/content cannot be reliably recovered when Figma exported text as outlined paths. Numeric glyph geometry exists but is not a trustworthy font token source.'},ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'tokens/filters-observed.json').write_text(json.dumps({'filter_signatures':dict(filter_sigs.most_common()),'gradient_signatures':dict(gradient_sigs.most_common())},indent=2),encoding='utf-8')

(OUT/'geometry/rect-dimensions.json').write_text(json.dumps([{'width':k[0],'height':k[1],'count':v} for k,v in rect_dims.most_common()],indent=2),encoding='utf-8')
(OUT/'geometry/dimension-frequencies.json').write_text(json.dumps({'rect_widths':dict(rect_widths.most_common()),'rect_heights':dict(rect_heights.most_common()),'small_dimensions_le_64':dict(small_dims.most_common()),'wide_control_heights':dict(wide_heights.most_common()),'screen_chrome_dimensions':[{'width':k[0],'height':k[1],'count':v} for k,v in screen_chrome_dims.most_common()]},indent=2),encoding='utf-8')
(OUT/'geometry/transforms.json').write_text(json.dumps(dict(transforms.most_common()),indent=2),encoding='utf-8')
(OUT/'components/component-sheet-fingerprints.json').write_text(json.dumps(component_fingerprints,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'components/per-file-style-inventory.json').write_text(json.dumps(file_styles,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'layouts/screen-layout-metrics.json').write_text(json.dumps(layout_metrics,ensure_ascii=False,indent=2),encoding='utf-8')

# duplicates - path exact repetitions. Exclude singletons, cap file listing but keep counts.
dups=[]
for h,r in path_hashes.items():
    if r['count']>1:
        dups.append({'sha256':h,'count':r['count'],'path_data_length':r['length'],'files':[{'file':f,'count':n} for f,n in r['files'].most_common()]})
dups.sort(key=lambda x:(-x['count'],-x['path_data_length']))
(OUT/'duplicates/repeated-paths.json').write_text(json.dumps({'note':'Exact SVG path-data duplicates. Includes repeated outlined text glyphs as well as repeated icons/shapes; therefore this is evidence for deduplication candidates, not an automatic icon equivalence list.','duplicate_path_count':len(dups),'items':dups},ensure_ascii=False,indent=2),encoding='utf-8')
imgdups=[{'sha256':h,'occurrences':xs} for h,xs in image_hashes.items() if len(xs)>1]
(OUT/'duplicates/embedded-images.json').write_text(json.dumps({'unique_embedded_images':len(image_hashes),'duplicate_groups':imgdups},ensure_ascii=False,indent=2),encoding='utf-8')

# source map summary
sm={
 'source_files':len(files),'component_sheets':sum(1 for x in inventory if x['kind']=='component-sheet'),'screen_or_reference_files':sum(1 for x in inventory if x['kind']!='component-sheet'),
 'elements_total':sum(x['element_count'] for x in inventory),'tags_global':dict(global_tags.most_common()),'colors_unique':len(colors),'rect_dimension_pairs_unique':len(rect_dims),
 'exact_duplicate_path_groups':len(dups),'embedded_image_unique':len(image_hashes),'text_elements_total':text_total,
 'derived_vector_assets':{'icons':len(list((OUT/'assets/icons').glob('*.svg'))),'file_types':len(list((OUT/'assets/file-types').glob('*.svg')))},
 'limitations':['Outlined text cannot be losslessly converted back to font family/weight/text style names.','Semantic component/state names are absent from exported SVG when Figma layer names are not represented in XML.','Spacing candidate values are observed geometry frequencies, not proof of original variable/token names.','Exact repeated path data contains both UI shapes/icons and outlined glyphs; semantic deduplication requires visual classification.']
}
(OUT/'source-map/summary.json').write_text(json.dumps(sm,ensure_ascii=False,indent=2),encoding='utf-8')

# Build report
largest=sorted(inventory,key=lambda x:x['bytes'],reverse=True)[:10]
topcolors=color_out[:30]; topsp=spacing[:30]
report=f'''# SHLZ design source — exhaustive SVG extraction\n\n## Scope\n\nProcessed **{len(files)} SVG files** from `svg-source.zip`: **{sm['component_sheets']} component/reference sheets** and **{sm['screen_or_reference_files']} screen/reference exports**. No UI implementation decisions are made in this pass.\n\n## What was formalized\n\n- complete source inventory with checksums, dimensions and XML element counts;\n- all observed fill/stroke colors with source evidence;\n- opacity, fill/stroke opacity, stroke widths, line caps/joins;\n- rectangle corner radii and circle radii;\n- candidate spacing/dimension scale derived from repeated geometry;\n- global rectangle/dimension frequency tables and screen chrome candidates;\n- per-component-sheet geometry/style fingerprints;\n- per-screen layout metrics;\n- filters/gradients by canonical signature;\n- embedded raster assets extracted by content hash;\n- exact repeated SVG path-data groups for deduplication analysis;\n- previously isolated 104 core vector icons and 21 file-type icons included as derivative assets;\n- explicit recoverability report for typography.\n\n## Corpus totals\n\n- XML elements: **{sm['elements_total']:,}**\n- `<path>` elements: **{global_tags.get('path',0):,}**\n- `<rect>` elements: **{global_tags.get('rect',0):,}**\n- `<g>` elements: **{global_tags.get('g',0):,}**\n- `<image>` elements: **{global_tags.get('image',0):,}**\n- actual `<text>` elements: **{text_total:,}**\n- unique observed colors: **{len(colors):,}**\n- unique rectangle dimension pairs: **{len(rect_dims):,}**\n- repeated exact path groups: **{len(dups):,}**\n- unique embedded raster payloads: **{len(image_hashes):,}**\n\n## Important boundary\n\nThe export converts text to paths. Therefore font family, font weight, line-height, letter-spacing and semantic text-style names **cannot be reconstructed reliably from SVG alone** unless explicitly present as XML/font attributes. This pass records that absence instead of inventing typography tokens.\n\nLikewise, observed values such as 8, 16, 24 or 32 px are recorded as **geometry-derived candidates**. They are not labeled as original Figma variables without evidence.\n\n## Largest source files\n\n'''
for x in largest: report+=f"- `{x['decoded_name']}` — {x['bytes']/1024/1024:.2f} MiB, {x['element_count']:,} elements\n"
report+='\n## Most frequent observed colors\n\n'
for c in topcolors: report+=f"- `{c['value']}` — {c['count']:,} uses ({c['fill_count']:,} fill / {c['stroke_count']:,} stroke), {len(c['files'])} source files\n"
report+='\n## Strongest small-dimension / spacing candidates\n\n'
for s in topsp: report+=f"- `{s['value']}px` — {s['count']:,} rectangle width/height observations\n"
report+='''\n## Files to use next\n\n- `tokens/*.json` — raw design primitives with evidence.\n- `components/component-sheet-fingerprints.json` — dimensions/styles by component sheet.\n- `layouts/screen-layout-metrics.json` — screen-level repeated geometry.\n- `duplicates/repeated-paths.json` — exact vector repetitions, requiring semantic filtering.\n- `inventory/source-inventory.json` — authoritative source map.\n- `source-map/summary.json` — machine-readable extraction summary and limitations.\n\n## What remains non-formalizable from these SVGs alone\n\n1. Original Figma layer/component/variant names when not encoded in SVG.\n2. Reliable typography family/weight/text-style tokens because text is outlined.\n3. Interaction semantics such as hover/focus/keyboard behavior unless represented as separate visual examples.\n4. Whether two visually similar repeated structures are intentionally one design-system component or merely coincidental reuse.\n5. Original Auto Layout constraints/resizing rules; only rendered geometry is available.\n\nThose boundaries are intentional: the extraction does not turn guesses into facts.\n'''
(OUT/'reports/extraction-report.md').write_text(report,encoding='utf-8')

# machine-readable README
readme='''# SHLZ Design Source\n\nExhaustive formalization pass over the supplied Figma SVG exports. This package is **source knowledge**, not a framework-specific UI library.\n\nStart with `reports/extraction-report.md` and `source-map/summary.json`.\n\nDirectories:\n- `inventory/` source files and checksums\n- `tokens/` observed visual primitives\n- `geometry/` dimension frequency data\n- `components/` component-sheet fingerprints\n- `layouts/` screen-level geometry\n- `duplicates/` exact duplicate/vector evidence\n- `assets/` extracted raster payloads and previously isolated vector icons\n- `source-map/` extraction coverage/limitations\n'''
(OUT/'README.md').write_text(readme,encoding='utf-8')

# simple self-contained catalog summary HTML from JSON data
rows=''.join(f"<tr><td>{x['decoded_name']}</td><td>{x['kind']}</td><td>{x['width']}×{x['height']}</td><td>{x['element_count']:,}</td><td>{x['bytes']/1024/1024:.2f} MiB</td></tr>" for x in inventory)
colorcards=''.join(f"<div class='sw'><i style='background:{c['value']}'></i><b>{c['value']}</b><span>{c['count']:,} uses</span></div>" for c in topcolors[:40] if c['value'].startswith('#'))
spans=''.join(f"<span class='pill'>{s['value']}px · {s['count']}</span>" for s in topsp[:40])
html=f'''<!doctype html><meta charset=utf-8><title>SHLZ Design Source Extraction</title><style>body{{font:14px system-ui;margin:32px;color:#172033;background:#f6f8fb}}h1{{font-size:28px}}.kpis{{display:flex;gap:12px;flex-wrap:wrap}}.k{{background:white;padding:16px 20px;border-radius:12px;box-shadow:0 1px 4px #0001}}.k b{{font-size:24px;display:block}}.colors{{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px}}.sw{{background:white;border-radius:10px;padding:8px;display:grid;grid-template-columns:32px 1fr;gap:2px 8px;align-items:center}}.sw i{{width:32px;height:32px;border-radius:8px;border:1px solid #ddd;grid-row:1/3}}.sw span{{color:#667;font-size:12px}}.pill{{display:inline-block;background:white;padding:6px 10px;border-radius:999px;margin:3px}}table{{width:100%;border-collapse:collapse;background:white;margin-top:16px}}th,td{{padding:8px 10px;border-bottom:1px solid #eee;text-align:left}}th{{position:sticky;top:0;background:#fff}}section{{margin:28px 0}}</style><h1>SHLZ Design Source — extraction</h1><div class=kpis><div class=k><b>{len(files)}</b>SVG files</div><div class=k><b>{sm['elements_total']:,}</b>elements</div><div class=k><b>{len(colors)}</b>colors</div><div class=k><b>{len(dups):,}</b>duplicate path groups</div><div class=k><b>{sm['derived_vector_assets']['icons']}</b>core icons</div></div><section><h2>Observed colors</h2><div class=colors>{colorcards}</div></section><section><h2>Small-dimension candidates</h2>{spans}</section><section><h2>Source inventory</h2><table><thead><tr><th>Source</th><th>Class</th><th>Canvas</th><th>Elements</th><th>Size</th></tr></thead><tbody>{rows}</tbody></table></section>'''
(OUT/'catalog/index.html').write_text(html,encoding='utf-8')

# copy extraction script
shutil.copy2('/mnt/data/extract_design_source.py',OUT/'tools/extract_design_source.py')
print(json.dumps(sm,ensure_ascii=False,indent=2))
