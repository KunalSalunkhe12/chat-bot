"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadIcon, SendIcon } from "lucide-react";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/build/pdf";
// @ts-ignore
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

type Message = {
  role: "user" | "bot";
  content: string;
};

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function ResumeChatbot() {
  const [resumeText, setResumeText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setIsUploaded(true);
      const reader = new FileReader();
      reader.onload = async function () {
        const typedArray = new Uint8Array(this.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let extractedText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          textContent.items.forEach((item: any) => {
            extractedText += item.str + " ";
          });
        }

        setResumeText(extractedText);
      };

      reader.readAsArrayBuffer(file);
      setMessages([
        {
          role: "bot",
          content: `Great! I've processed your resume "${file.name}". What would you like to know about it?`,
        },
      ]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (input.trim() && resumeText) {
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeText, question: input }),
        });

        if (!response.ok) {
          throw new Error("API response was not ok");
        }

        const data = await response.json();
        setMessages((prev) => [...prev, { role: "bot", content: data.result }]);
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              "Sorry, there was an error processing your question. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Resume Chatbot</CardTitle>
      </CardHeader>
      <CardContent>
        {!isUploaded ? (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF (MAX. 800x400px)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf"
              />
            </label>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`rounded-lg p-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
      {isUploaded && (
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              type="text"
              placeholder="Ask a question about your resume..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <SendIcon className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      )}
    </Card>
  );
}
