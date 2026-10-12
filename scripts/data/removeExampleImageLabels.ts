const imageLabelFields = new Set(['imageLabel', 'mediaLabel', 'emptyImageLabel', 'imageNotice'])

// Only captions/labels are removed. Preserve alt text, project text and before/after labels.
export function removeExampleImageLabels<T>(value: T): T {
  if (Array.isArray(value)) {
    const items = value.map(removeExampleImageLabels)
    return (items.some((item, index) => item !== value[index]) ? items : value) as T
  }
  if (!value || typeof value !== 'object') return value

  let changed = false
  const entries = Object.entries(value).map(([key, child]) => {
    const cleaned =
      imageLabelFields.has(key) && typeof child === 'string' && /exempelbild/i.test(child)
        ? null
        : removeExampleImageLabels(child)
    if (cleaned !== child) changed = true
    return [key, cleaned]
  })
  return (changed ? Object.fromEntries(entries) : value) as T
}
