import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { initLlama, releaseAllLlama } from "llama.rn";
import RNFS from "react-native-fs";
import axios from "axios";
import { ProgressBar } from "react-native-paper";
import DeviceInfo from "react-native-device-info"; 
import {MODEL_NAME, HF_TO_GGUF, GGUF_FILE} from '@env'


const App = () => {
  const [availableGGUFs, setAvailableGGUFs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [context, setContext] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInput, setUserInput] = useState('');

  const fetchAvailableGGUFs = async (modelFormat) => {
    if (!modelFormat) {
      Alert.alert('Error', 'Please select a model format first.');
      return;
    }

    try {
      const repoPath = HF_TO_GGUF[modelFormat];
      if (!repoPath) {
        throw new Error(
          `No repository mapping found for model format: ${modelFormat}`,
        );
      }

      const response = await axios.get(
        `https://huggingface.co/api/models/${repoPath}`,
      );

      if (!response.data?.siblings) {
        throw new Error('Invalid API response format');
      }

      const files = response.data.siblings.filter((file) =>
        file.rfilename.endsWith('.gguf'),
      );

      setAvailableGGUFs(files.map((file) => file.rfilename));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch .gguf files';
      Alert.alert('Error', errorMessage);
      setAvailableGGUFs([]);
    }
  };

  const checkMemoryBeforeLoading = async (modelPath) => {
    const stats = await RNFS.stat(modelPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    const availableMemoryMB = (await DeviceInfo.getFreeDiskStorage()) / (1024 * 1024);

    console.log(`Model Size: ${fileSizeMB.toFixed(2)} MB`);
    console.log(`Available Memory: ${availableMemoryMB.toFixed(2)} MB`);

    if (fileSizeMB > availableMemoryMB * 0.8) {
      Alert.alert("Low Memory", "The model may be too large to load!");
      return false;
    }

    return true;
  };

  const handleDownloadModel = async (file) => {
    const downloadUrl = `https://huggingface.co/${HF_TO_GGUF[MODEL_NAME]}/resolve/main/${file}`;
    console.log('Downloading model from:', downloadUrl);
    // we set the isDownloading state to true to show the progress bar and set the progress to 0
    setIsDownloading(true);
    setProgress(0);

    try {
      // we download the model using the downloadModel function, it takes the selected GGUF file, the download URL, and a progress callback function to update the progress bar
      const destPath = await downloadModel(file, downloadUrl, progress => setProgress(progress),);
      console.log("Downloaded model to:", destPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed due to an unknown error.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadModel = async (fileName, downloadUrl, onProgress) => {
    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    console.log("destination path:", destPath);
    // Check if the file already exists to avoid re-downloading
    const fileExists = await RNFS.exists(destPath);
    if (fileExists) {
      console.log("File already exists:", destPath);
      await loadModel(fileName);
      return destPath;
    }

    console.log("Starting download:", downloadUrl);

    try {
      await RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: destPath,
        progress: (res) => {
          if (res.contentLength > 0) {
            const progress = res.bytesWritten / res.contentLength;
            onProgress(progress);
          }
        },
        background: true,
        discretionary: true,
      }).promise;

      const fileExistsAfterDownload = await RNFS.exists(destPath);
      console.log("File exists after download:", fileExistsAfterDownload);

      if (!fileExistsAfterDownload) {
        throw new Error("Download failed. File does not exist.");
      }

      if (destPath) {
        await loadModel(fileName);
      }
      return destPath;
    } catch (error) {
      console.error("Download failed:", error);
      throw new Error("Failed to download model.");
    }
  };

  const loadModel = async (modelName) => {
    try {
      const destPath = `${RNFS.DocumentDirectoryPath}/${modelName}`;
      console.log("Trying to load model from:", destPath);

      // Ensure the model file exists before attempting to load it
      const fileExists = await RNFS.exists(destPath);
      if (!fileExists) {
        Alert.alert(`Error Loading Model', 'The model file does not exist at ${destPath}`);
        return false;
      }

      if (context) {
        await releaseAllLlama();
        setContext(null);
        setConversation([]);
      }

      const shouldLoad = await checkMemoryBeforeLoading(destPath);
      if (!shouldLoad) return;

      const llamaContext = await initLlama({
        model: destPath,
        n_ctx: 2048,
        n_gpu_layers: 0
      });
      console.log("Llama model loaded successfully", llamaContext);
      setContext(llamaContext);
      return true;
    } catch (error) {
      Alert.alert('Error Loading Model', error.message || 'An unknown error occurred.');
      return false;
    }
  };

  const handleSendMessage = async () => {
    // Check if context is loaded and user input is valid
    if (!context) {
      Alert.alert('Model Not Loaded', 'Please load the model first.');
      return;
    }

    if (!userInput.trim()) {
      Alert.alert('Input Error', 'Please enter a message.');
      return;
    }

    const newConversation = [
      // ... is a spread operator that spreads the previous conversation array to which we add the new user message
      ...conversation,
      { role: 'user', content: userInput },
    ];
    setIsGenerating(true);
    // Update conversation state and clear user input
    setConversation(newConversation);
    setUserInput('');

    try {
      // we define list the stop words for all the model formats
      const stopWords = [
        '</s>',
        '<|end|>',
        'user:',
        'assistant:',
        '<|im_end|>',
        '<|eot_id|>',
        '<|end▁of▁sentence|>',
        '<｜end▁of▁sentence｜>',
      ];
      // now that we have the new conversation with the user message, we can send it to the model
      const result = await context.completion({
        messages: newConversation,
        n_predict: 10000,
        stop: stopWords,
      });

      // Ensure the result has text before updating the conversation
      if (result && result.text) {
        setConversation(prev => [
          ...prev,
          { role: 'assistant', content: result.text.trim() },
        ]);
      } else {
        throw new Error('No response from the model.');
      }
    } catch (error) {
      // Handle errors during inference
      Alert.alert(
        'Error During Inference',
        error instanceof error.message || 'An unknown error occurred.',
      );
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <View>
      <TouchableOpacity onPress={() => fetchAvailableGGUFs(MODEL_NAME)}>
        <Text>Fetch GGUF Files</Text>
      </TouchableOpacity>
      <ScrollView>
        {availableGGUFs.map((file) => (
          <Text key={file}>{file}</Text>
        ))}
      </ScrollView>


      <TouchableOpacity
        onPress={() => {
          handleDownloadModel(GGUF_FILE);
        }}
      ><Text>Download Model</Text></TouchableOpacity>
      {isDownloading && <ProgressBar progress={progress} />}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 10,
          marginHorizontal: 10,
        }}
      >
        <TextInput
          style={{ flex: 1, borderWidth: 1 }}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type your message here..."
        />
        <TouchableOpacity
          onPress={handleSendMessage}
          style={{ backgroundColor: "#007AFF" }}
        >
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {conversation.map((msg, index) => (
          <Text style={{ marginVertical: 10 }} key={index}>{msg.content}</Text>
        ))}
      </ScrollView>

    </View>
  )
};

export default App;
