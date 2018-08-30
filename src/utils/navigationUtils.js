export const replaceRoute = (navigation, routeTo, params) => {
  navigation.goBack(null)
  setTimeout(() => navigation.navigate(routeTo, params), 800)
}
