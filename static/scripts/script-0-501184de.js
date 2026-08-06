
document.addEventListener("mouseenter", (e) => {
  const t = e.target
  if (t && t.closest && t.closest(".spine, .perch")) e.stopPropagation()
}, true)
