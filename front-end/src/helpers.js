export const hasNoToken = () => {
  return localStorage.getItem('token') === '' || localStorage.getItem('token') === null;
}

export const fileToDataUrl = (file) => {
  const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
  const valid = validFileTypes.find(type => type === file.type);
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve,reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

export const loadImageFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      resolve(e.target.result);
    }
    reader.readAsDataURL(file);
  })
}