"use client";

import React, { useState, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import { Camera, CameraType } from "react-camera-pro";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const camera = useRef<CameraType>(null);
  const [image, setImage] = useState<string | null>(null);
  const [output, setOutput] = useState({
    items: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const takePhoto = async () => {
    try {
      if (camera.current) {
        setIsLoading(true);

        const photo = camera.current.takePhoto();

        const response = await fetch("/api/openai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: photo }),
        });
        const data = await response.json();
        setOutput(data);

        if (photo instanceof ImageData) {
          const blob = new Blob([photo.data.buffer], { type: "image/png" });
          const url = URL.createObjectURL(blob);
          setImage(url);
        } else {
          setImage(photo);
        }

        const sheets = await fetch("/api/sheets/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        });
        const sheetData = await sheets.json();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      toast.success("Saved to sheets!");
    }
  };

  return (
    <main className="min-h-screen w-full px-4 py-8 flex flex-col items-center justify-start gap-8">
      {image ? (
        <>
          <img src={image} alt="Taken photo" className="w-full max-w-xl" />

          {output.items.length > 0 && (
            <div className="flex flex-col gap-4 w-full max-w-xl">
              <p className="text-3xl font-bold mb-4">Total: {output.total}</p>

              {output.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex flex-col">
                    <p>{item.tag}</p>
                    <p className="text-xs text-zinc-600">{item.description}</p>
                  </div>
                  <p>{item.price}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setImage(null);
              setOutput({ items: [], total: 0 });
            }}
            className="flex items-center justify-center w-full px-4 py-1.5 bg-black rounded-lg transition hover:bg-zinc-900 text-white max-w-xl"
          >
            New Sale
          </button>
        </>
      ) : (
        <>
          {isLoading ? (
            <div className="py-32 w-full flex items-center justify-center">
              <LoaderCircle className="size-12 animate-spin" />
            </div>
          ) : (
            <>
              <div className="w-full max-w-xl">
                <Camera
                  ref={camera}
                  aspectRatio={4 / 3}
                  facingMode="environment"
                  errorMessages={{ noCameraAccessible: "No camera found" }}
                />
              </div>
              <button
                onClick={takePhoto}
                className="flex items-center justify-center w-full px-4 py-1.5 bg-black rounded-lg transition hover:bg-zinc-900 text-white max-w-xl"
              >
                Take Photo
              </button>
            </>
          )}
        </>
      )}
      <Toaster />
    </main>
  );
}
