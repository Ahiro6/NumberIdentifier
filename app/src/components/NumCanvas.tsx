import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";

import { Canvas, Path, Skia, CanvasRef, ColorType, AlphaType } from '@shopify/react-native-skia'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import NumberML from "./NumberML";


export default function NumCanvas() {

  const [paths, setPaths] = useState<any[]>([])
  const [currentPath, setCurrentPath] = useState<any>(null)
  const [imageData, setImageData] = useState<any>(null)

  const canvasRef = useRef<CanvasRef>(null)


  const gesture = Gesture.Pan()
    .onBegin((e) => {
      const path = Skia.Path.Make()

      path.moveTo(e.x, e.y)
      setCurrentPath(path)
    })
    .onUpdate((e) => {
      if (!currentPath) return

      currentPath.lineTo(e.x, e.y)
      setCurrentPath(currentPath.copy())
    })
    .onEnd((e) => {
      if (!currentPath) return

      setPaths((prev) => [...prev, currentPath])
      setCurrentPath(null)
    })


  const clearCanvas = () => {
    setPaths([])
    setCurrentPath(null)
    setImageData(null)
  }

  const takePicture = () => {
    const image = canvasRef.current?.makeImageSnapshot()

    if (!image) return

    const pixels = image.readPixels(0, 0, {
      width: image.width(),
      height: image.height(),
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Unpremul
    });

    if (!pixels) return

    const data = new Uint8Array(pixels.buffer)
    const width = image.width()
    const height = image.height()

    setImageData({ data, width, height })
  }

  return (<View style={styles.container}>
    <NumberML img={imageData}></NumberML>
    <View style={styles.subContainer}>
      <GestureDetector gesture={gesture}>
        <Canvas ref={canvasRef} style={styles.canvas}>
          {paths.map((path, index) => (
            <Path
              key={index}
              path={path}
              color="white"
              style="stroke"
              strokeWidth={16}
              strokeCap="round"
              strokeJoin="round"
            />
          ))}
          {currentPath && (
            <Path
              path={currentPath}
              color="white"
              style="stroke"
              strokeWidth={16}
              strokeCap="round"
              strokeJoin="round"
            />
          )}
        </Canvas>
      </GestureDetector>

    </View>

      <View style={styles.buttonContainer}>
        <Pressable onPress={takePicture} style={styles.button}>
          <Text style={styles.buttonText}>Submit</Text>
        </Pressable>
        <Pressable onPress={clearCanvas} style={styles.button}>
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
      </View>
  </View>
  )
}


const styles = StyleSheet.create({
  container: {
    alignItems: "center",

  },
  subContainer: {
    paddingHorizontal: 10
  },
  canvas: {
    width: 450,
    height: 450,
    backgroundColor: "black",
  },
  buttonContainer: {
    flexDirection: 'row'
  },
  button: {
    margin: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#e91a1a",
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});