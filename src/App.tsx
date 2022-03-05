import { DragEventHandler, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

import "./styles.css";

const ffmpeg = createFFmpeg({
  log: true
  // corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js"
});

export default function App() {
  const [message, setMessage] = useState("Drop a GIF file.");
  const [videoSrc, setVideoSrc] = useState("");

  const doGifToMp4 = async (fileName: string) => {
    setMessage("Loading ffmpeg-core.js");

    await ffmpeg.load();

    setMessage("Start transcoding");

    const inputFileName = `${fileName}.gif`;
    const outputFileName = `${fileName}.mp4`;

    ffmpeg.FS("writeFile", inputFileName, await fetchFile(inputFileName));

    await ffmpeg.run("-i", inputFileName, "-c:v", "libx264", outputFileName);

    setMessage("Complete transcoding");

    const data = ffmpeg.FS("readFile", outputFileName);
    ffmpeg.FS("unlink", inputFileName);
    ffmpeg.FS("unlink", outputFileName);

    setVideoSrc(
      URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }))
    );
  };

  const dropHandler: DragEventHandler<HTMLDivElement> = (ev) => {
    console.log("File(s) dropped");

    ev.preventDefault();

    const firstFile = ev.dataTransfer.files[0];

    console.log(firstFile);

    if (firstFile.type !== "image/gif") {
      setMessage("Not a GIF file.");
      return;
    }

    doGifToMp4(firstFile.name);
  };

  return (
    <div
      className="App"
      onDragOver={(ev) => {
        ev.preventDefault();
      }}
      onDrop={dropHandler}
    >
      <h1>{message}</h1>
      {videoSrc && <video src={videoSrc} controls />}
    </div>
  );
}
