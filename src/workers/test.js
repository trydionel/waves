self.onmessage = () => {
  self.postMessage({
    answer: 42,
  });
};