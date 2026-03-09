export default component => {
  component.install = app => {
    const name = component.name || component.__name;
    app.component(name, component);
  };
  return component;
};
