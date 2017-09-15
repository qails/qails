export const fetchModels = Model => (obj, options) => new Promise((resolve, reject) => {
  Model.fetchPage(options).then((items) => {
    resolve(items.toJSON());
  }).catch(err => reject(err));
});

export const fetchModel = Model => (obj, { id, withRelated }) => new Promise((resolve, reject) => {
  Model.findById(id, { withRelated }).then((items) => {
    resolve(items.toJSON());
  }).catch(err => reject(err));
});

export const updateModel = Model => (obj, { id, input }) => new Promise((resolve, reject) => {
  Model.update(input, { id }).then((items) => {
    resolve(items.toJSON());
  }).catch(err => reject(err));
});

export const deleteModel = Model => (obj, { id }) => new Promise((resolve, reject) => {
  Model.findById(id).then((items) => {
    items.destroy().then(() => {
      resolve(0);
    });
  }).catch(err => reject(err));
});
