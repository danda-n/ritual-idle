/* Gear, component and slot glyphs. Same grammar as icons.js (24px, 1.75 stroke, currentColor, 0.2 fill for mass). Drafts for the woodcut pass. */
(function(){
var F=' fill="currentColor" fill-opacity="0.2"';
var P={
saltPouch:'<path d="M9 7.5 7.5 4.5h9L15 7.5"/><path d="M8 7.5h8"/><path d="M8 7.5c-3 2.5-3.5 6-2.5 9 .8 2.5 3.4 3.5 6.5 3.5s5.7-1 6.5-3.5c1-3 .5-6.5-2.5-9"'+F+'/><path d="M10 13.5h.01M13.5 15h.01M12 11.5h.01"/>',
ironAmulet:'<path d="M7 3c0 4 2 6 5 7 3-1 5-3 5-7"/><path d="M12 10v1.5"/><path d="M12 11.5l4 4.5-4 5-4-5Z"'+F+'/><path d="M12 14v4"/>',
knife:'<path d="M4 20l4.5-4.5"/><path d="M7 14l3 3"/><path d="M9 15.5 19.5 4.5c.6 3.2-1 7-4.5 10L11.5 17Z"'+F+'/>',
poker:'<path d="M6.5 17.5 18 6"/><path d="M18 6l.8-3M18 6l3-.8"/><circle cx="5" cy="19" r="2"'+F+'/>',
tallowLantern:'<path d="M9 3.5h6M12 3.5V5.5"/><path d="M7.5 7h9l-1 12h-7Z"'+F+'/><path d="M6.5 7h11M7 19h10"/><path d="M12 10.5c1.2 1.2 1.2 2.8 0 4-1.2-1.2-1.2-2.8 0-4Z"/>',
censer:'<path d="M8 3h8M12 3v3.5"/><path d="M5.5 10h13c0 4.5-3 7.5-6.5 7.5S5.5 14.5 5.5 10Z"'+F+'/><path d="M9 17.5l-1 3h8l-1-3"/><path d="M10 6.5c-1 1 1 2 0 3M14 6.5c-1 1 1 2 0 3"/>',
shirt:'<path d="M9 3.5 4 6l1.5 4.5 2.5-1v11h8v-11l2.5 1L20 6l-5-2.5c-.5 1.5-1.5 2.5-3 2.5S9.5 5 9 3.5Z"'+F+'/><path d="M9 17.5l1 1 1-1 1 1 1-1 1 1 1-1"/>',
herbBelt:'<path d="M2.5 10h19v4h-19Z"'+F+'/><rect x="10" y="9" width="4" height="6" rx="0.5"/><path d="M17 14v5M17 16.5c1.5 0 2.5-1 2.5-2.5"/>',
linen:'<path d="M4 6h16v12H4Z"'+F+'/><path d="M4 9h16M4 15h16"/><path d="M7 12l1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1"/>',
ironBlank:'<path d="M5 9l7-4 7 4-7 4Z"'+F+'/><path d="M5 9v5l7 4 7-4V9M12 13v5"/>',
lanternFrame:'<path d="M8 4h8M12 2.5V4"/><path d="M7 7h10M7 19h10M8 7v12M16 7v12M12 7v12"/>',
redThread:'<ellipse cx="11" cy="12" rx="5" ry="7"'+F+'/><path d="M6.5 9.5l9-2M6 13l10-2.5M6.5 16.5l9-2"/><path d="M16 12c2 1 3 3 4 6"/>',
slotHand:'<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 5V4a1.5 1.5 0 0 1 3 0v7M14 6a1.5 1.5 0 0 1 3 0v6.5c0 4-2.5 7.5-6 7.5-2.5 0-4-1.3-5.5-3.5L4 14a1.5 1.5 0 0 1 2.5-1.5L8 14"'+F+'/>',
anvil:'<path d="M4 8h13c0 2.5 1.5 3.5 3.5 3.5V8"/><path d="M4 8c0 2.5 2 4 5 4h5"'+F+'/><path d="M10 12v4M14 12v4M7 20h10l-2-4H9Z"/>'
};
Object.assign(window.RI.paths,P);
window.RI.skillIcon.crafting='anvil';
window.RI.slotIcon={amulet:'ironAmulet',hand:'slotHand',lantern:'tallowLantern',garment:'shirt',belt:'herbBelt'};
})();
