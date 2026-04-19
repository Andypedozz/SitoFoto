export const getOptimizedUrl = (url, width) => {
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width},c_fill/`
  );
};