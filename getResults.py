import json
import requests
from base64 import b64encode

ENDPOINT_URL = 'https://vision.googleapis.com/v1/images:annotate'
api_key = "AIzaSyA_DOnmygw3L2z4qkkhJSrGxuYVo7kWk54"
def makeImageData(imgpath):
    img_req = None
    with open(imgpath, 'rb') as f:
        ctxt = b64encode(f.read()).decode()
        img_req = {
            'image': {
                'content': ctxt
            },
            'features': [{
                'type': 'DOCUMENT_TEXT_DETECTION',
                'maxResults': 1
            }]
        }
    return json.dumps({"requests": img_req}).encode()



def requestOCR(imgpath):
    imgdata = makeImageData(imgpath)
    response = requests.post(ENDPOINT_URL, 
                           data = imgdata, 
                           params = {'key': api_key}, 
                           headers = {'Content-Type': 'application/json'})
    data = json.loads(response.text)
    return data["responses"][0]['fullTextAnnotation']['text']





