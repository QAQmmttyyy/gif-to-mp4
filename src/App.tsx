import { DragEventHandler, useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

import "./styles.css";

const ffmpeg = createFFmpeg({
  log: true,
});

export default function App() {
  const [message, setMessage] = useState("Drop a GIF file.");
  const [videoSrc, setVideoSrc] = useState("");

  const doGifToMp4 = async (file: File) => {
    setMessage("Preparing");

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    setMessage("Start");

    const inputFileName = file.name;
    const outputFileName = `${file.name.replace(/\.gif$/, "")}.mp4`;

    ffmpeg.FS("writeFile", inputFileName, await fetchFile(file));

    setMessage("Processing");
    await ffmpeg.run("-i", inputFileName, outputFileName);

    setMessage("Complete");

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

    doGifToMp4(firstFile);
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
