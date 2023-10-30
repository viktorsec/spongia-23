const slugify = (str) => {
  return String(str)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toUpperCase() // convert to uppercase
    .replace(/[^A-Z0-9 _]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '_') // replace spaces with underscores
    .replace(/_+/g, '_'); // remove consecutive underscores
}

export default slugify;
