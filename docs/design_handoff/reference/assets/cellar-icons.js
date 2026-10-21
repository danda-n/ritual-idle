/* Cellar glyphs: foes, loot, remedies, stats, the place mark and the cellar-door ornament.
   Same grammar as icons.js (24px grid, 1.75 stroke, round joins, currentColor, 0.2 fill for mass).
   Drafts to hand to the illustrator for the woodcut pass; the silhouettes are the spec. */
(function(){
var F=' fill="currentColor" fill-opacity="0.2"';
var P={
skrzat:'<path d="M7.5 8.5 5 3.5l4.2 2.6M16.5 8.5 19 3.5l-4.2 2.6"/><circle cx="12" cy="11" r="5"'+F+'/><path d="M10 10.5h.01M14 10.5h.01"/><path d="M10.5 13.5c1 .7 2 .7 3 0"/><path d="M9 16l-1.5 4.5M15 16l1.5 4.5"/>',
kikimora:'<path d="M12 2v20"/><path d="M9 7.5c0-2 6-2 6 0v7c0 2-6 2-6 0Z"'+F+'/><path d="M9 9.5l6 1.2M9 12.5l6 1.2"/><path d="M8 19h8"/><path d="M15 9c2.5.5 4 2 4.5 4.5"/>',
zmora:'<path d="M2.5 20h19"/><path d="M4 20c0-2.2 1.8-3.5 4-3.5h9c2 0 3.5 1.3 3.5 3.5"/><circle cx="12" cy="6" r="2.4"'+F+'/><path d="M8.5 16.5 9 10.5c.2-1.3 1.5-2 3-2s2.8.7 3 2l.5 6"'+F+'/><path d="M9 12.5 6.5 16M15 12.5l2.5 3.5"/>',
domovoi:'<path d="M6.5 9.5C7 5.5 9 3.5 12 3.5s5 2 5.5 6"/><path d="M5.5 9.5h13"/><path d="M10 12h.01M14 12h.01"/><path d="M7 11.5c0 6 2 9.5 5 9.5s5-3.5 5-9.5"'+F+'/><path d="M10 16c1.3 1 2.7 1 4 0M12 16v3"/>',
poultice:'<path d="M5.5 11c0-2.3 3-3.5 6.5-3.5s6.5 1.2 6.5 3.5l-1.2 7.5c-.3 1.6-2.7 2.5-5.3 2.5s-5-.9-5.3-2.5Z"'+F+'/><path d="M9 7.5 12 3l3 4.5"/><path d="M7 13.5h10"/>',
threadKnot:'<path d="M3.5 20.5c3-2 4.2-5 5-8.5"/><circle cx="12" cy="10" r="3.5"'+F+'/><path d="M15.5 12c1.5 2.5 2.8 5.5 5 8.5"/><path d="M8.5 9c2-2.2 5-2.2 7 0"/>',
button:'<circle cx="12" cy="12" r="8"'+F+'/><circle cx="12" cy="12" r="5.2"/><path d="M10.5 10.5h.01M13.5 10.5h.01M10.5 13.5h.01M13.5 13.5h.01"/>',
spunThread:'<path d="M6.5 4h11M6.5 20h11"/><path d="M8 4v16M16 4v16"/><path d="M8 7.5l8 2.2M8 11.5l8 2.2M8 15.5l8 2.2"/>',
tangledLock:'<path d="M8 3c-2.2 3 2.2 5 0 8.5s2.2 5.5 0 9"/><path d="M12 3c-2.2 3 2.2 5 0 8.5s2.2 5.5 0 9"/><path d="M16 3c-2.2 3 2.2 5 0 8.5s2.2 5.5 0 9"/><path d="M5.5 12h13"/>',
windowCharm:'<rect x="5" y="3.5" width="14" height="17" rx="1"'+F+'/><path d="M12 3.5v17M5 12h14"/><path d="M9 20.5v2M15 20.5v2"/>',
health:'<path d="M12 20s-7.5-4.5-7.5-10A4 4 0 0 1 12 8a4 4 0 0 1 7.5 2c0 5.5-7.5 10-7.5 10Z"'+F+'/>',
ward:'<path d="M12 3 5 6v5.5c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5V6Z"'+F+'/><path d="M12 8v8M8.5 11.5h7"/>',
strike:'<path d="M12 3c3 3.8 5 6 5 9.8a5 5 0 0 1-10 0c0-2 .9-3.2 2-4.2.1 1.9 1 3 2.2 3.1 0-3-1.3-5 .8-8.7Z"'+F+'/>',
speed:'<path d="M7 3.5h10M7 20.5h10"/><path d="M8 3.5c0 4.5 4 5.5 4 8.5s-4 4-4 8.5M16 3.5c0 4.5-4 5.5-4 8.5s4 4 4 8.5"/><path d="M10 18h4"'+F+'/>',
cellar:'<path d="M4.5 21V11a7.5 7.5 0 0 1 15 0v10"'+F+'/><path d="M2.5 21h19"/><path d="M12 3.5V21"/><path d="M9.5 14h.01M14.5 14h.01"/><path d="M4.5 11h15"/>',
lock:'<rect x="6" y="11" width="12" height="9" rx="1.5"'+F+'/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>'
};
Object.assign(window.RI.paths,P);
window.RI.skillIcon.warding='ward';
/* Cellar-door ornament: a low stone arch over three steps, drawn wide for headings and the intro */
window.RI.cellarDoor=function(w){w=w||120;var h=Math.round(w*0.5);return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 58h116"/><path d="M34 58V30a26 26 0 0 1 52 0v28"/><path d="M40 58V31a20 20 0 0 1 40 0v27" fill="currentColor" fill-opacity="0.12"/><path d="M46 58v-4h28v4M50 54v-4h20v4M54 50v-4h12v4"/><path d="M60 11v4M47 15l2 3.4M73 15l-2 3.4M38 24l3.4 2M82 24l-3.4 2"/><path d="M8 58l8-7 6 7M112 58l-8-7-6 7" opacity="0.6"/><circle cx="60" cy="36" r="2.2" fill="currentColor"/></svg>';};
})();
