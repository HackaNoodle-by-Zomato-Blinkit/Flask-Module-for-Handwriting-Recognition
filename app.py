from flask import Flask, render_template,jsonify,request
from flask_cors import CORS
import cv2 
import os 
import HandTrackingModule as htm
import numpy as np
import time
from jacardmetric import jaccard_similarity
from getResults import *
import random 





app = Flask(__name__)
CORS(app)
camera = cv2.VideoCapture(0)
imgCanvas = np.zeros((720,1280,3),np.uint8)
score = 0 

def start_painter():
    global imgCanvas
    folderPath = "Header"
    myList = os.listdir(folderPath)
    overlayList = []
    imgCanvas = np.zeros((720,1280,3),np.uint8)

    for imPath in myList:
        image = cv2.imread(f'{folderPath}/{imPath}')
        overlayList.append(image)

    header = overlayList[0]
    cap = cv2.VideoCapture(0)
    cap.set(3,1280)
    cap.set(4,720)
    drawColor = (255, 0, 255)
    brushThickness = 15
    eraserThickness = 100
    xp,yp = (0,0)


    detector = htm.HandDetector(detectionCon=0.85)
    while True:
        # 1. Import Image
        success,img = cap.read()
        if not success:
            break
        img = cv2.flip(img,1)
        # 2. Find Hand Landmarks
        img = detector.findHands(img)
        lmList = detector.findPosition(img,draw = False)
        if len(lmList) != 0:
            # Tip of Index and Middle Finger
            x1,y1 = lmList[8][1:]
            x2,y2 = lmList[12][1:]

            # 3. Check which fingers are up
            fingers = detector.fingersUp()
            # 4. If Selection mode - Two fingers are up
            if fingers[1] and fingers[2]:
                xp,yp = 0,0
                # Checking for the option being clicked
                if y1 < 125: 
                    if 250 < x1 < 450 : 
                        header = overlayList[0]
                        drawColor = (255, 0, 255)
                    elif 550 < x1 < 750 :
                        header = overlayList[1]
                        drawColor = (255, 0, 0)
                    elif 800 < x1 < 950:
                        header = overlayList[2]
                        drawColor = (0, 255, 0)
                    elif 1050 < x1 < 1200:
                        header = overlayList[3] 
                        drawColor = (0, 0, 0)
                cv2.rectangle(img, (x1,y1 - 25),(x2, y2 + 25),drawColor,cv2.FILLED)

                    
            elif fingers[1] and not fingers[2]: 
                cv2.circle(img, (x1, y1),15,drawColor,cv2.FILLED)
                if xp == 0 and yp == 0 :
                    xp,yp = x1,y1

                if drawColor == (0,0,0):
                    cv2.line(img, (xp, yp),(x1,y1),drawColor,eraserThickness)
                    cv2.line(imgCanvas, (xp, yp),(x1,y1),drawColor,eraserThickness)

                cv2.line(img, (xp, yp),(x1,y1),drawColor,brushThickness)
                cv2.line(imgCanvas, (xp, yp),(x1,y1),drawColor,brushThickness)
                
                xp,yp = x1, y1

            # 5. If Drawing mode - Index finger is up
        


        # Set the header image 
        img[0:125,0:1280] = header
        img = cv2.addWeighted(img, 0.5,imgCanvas,0.5,0)
        ret,buffer = cv2.imencode('.jpg',img)
        frame = buffer.tobytes()

        yield(b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
       
   

@app.route('/save_image',methods=['GET'])
def save_and_score():
    global imgCanvas,score
    word = request.args.get('word')
    image_id = int(request.args.get('id'))
    cv2.imwrite(f'{image_id}.png',imgCanvas)
    imgCanvas = np.zeros((720,1280,3),np.uint8)
    data = requestOCR(f'{image_id}.png')
    score = jaccard_similarity(data,word)
    return jsonify({
        "Score" : jaccard_similarity(data,word)*10,
        "Word" : data
    })

@app.route("/currentscore",methods = ['GET'])
def getScore():
    global score
    return jsonify({
        "score" : score
    })

@app.route('/video')
def video():
    return app.response_class(start_painter(),mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route("/")
def home():
    global score
    score = 0 
    return render_template("index.html")

@app.route("/end")
def endtest():
    global score
    return render_template("endtest.html",context={'score': score})

app.run(port = 8080, debug= True)

