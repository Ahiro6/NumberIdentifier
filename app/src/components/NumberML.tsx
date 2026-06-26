import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";


export default function NumberML({img}: any) {

    const [data, setData] = useState<any>(null)

    const run = async (img: any) => {
        try {
            const res = await fetch('http://localhost:5000/predict', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    pixels: Array.from(img.data),
                    width: img.width,
                    height: img.height
                })
            })

            const { digit } = await res.json()

            return digit
        }
        catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        if (!img) {
            setData(null)
            return
        }

        const predict = async () => {
            setData(null)

            const res = await run(img)

            setData(res)
        }

        predict()
    }, [img])

    return (<View style={style.container}>
        <Text style={style.text}>{data ? data: (data == 0 ? '0' : ' ')}</Text>
    </View>)
}

const style = StyleSheet.create({
    container: {
        marginBottom: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // padding: 20,
        width: '100%',
        backgroundColor: 'red'
    },

    text: {
        color: 'white',
        margin: 10,
        fontSize: 30,
        textAlign: 'center'
    },

    blankText: {
        color: 'white',
        margin: 10,
        fontSize: 30
    }

})