function getWorkerInstance(e){var o=window.URL||window.webkitURL;if(void 0==o||void 0==window.Blob||void 0==window.Worker||void 0==e)return null;var r=new Blob([e]),n=o.createObjectURL(r),i=new Worker(n);return o.revokeObjectURL(n),i}