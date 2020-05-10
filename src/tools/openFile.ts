export function openFile(): Promise<File> {
  return new Promise((resolve) => {
    let input = document.createElement("input");
    input.style.display = "none";
    if (input != null) {
      input.type = "file";

      input.onchange = (_) => {
        if (input.files != null) {
          let files = Array.from(input.files);
          resolve(files[0]);
        }
      };

      input.click();
    }
  });
}