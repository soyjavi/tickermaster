const NO_DATA_HTML = '<span class="color-lighten">No data</span>';

export default (values) => (values.length > 0 ? values.toString().replace(/,/g, '') : NO_DATA_HTML);
