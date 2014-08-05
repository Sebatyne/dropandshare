from flask import Flask, Response, render_template, redirect, request
from werkzeug import secure_filename

import datetime
import json
import md5
import os
import time
import sys

app = Flask(__name__)


def getFileMd5(file):
    fd = open(file, 'rb')
    m = md5.md5()
    while True:
        data = fd.read(8192)
        if not data:
            break
        m.update(data)
    return m.hexdigest()


def updateDB(content, md5sum, user=None, isText=False):
# datetime.datetime.frometimestamp(date.date())
    date = time.time()
    user = user
    try:
        db = json.loads(open(DB_FILE, "r").read())
    except:
        db = []
    record = dict(content=content,
                  isText=isText,
                  date=date,
                  user=user,
                  md5=md5sum)
    db.append(record)
    open(DB_FILE, "w").write(json.dumps(db))


@app.route('/api/get/documents')
def getdocs():
    if os.path.exists(DB_FILE):
        docs = json.loads(open(DB_FILE, 'r').read())
    else:
        docs = {}
    for doc in docs:
        if not doc['isText']:
            doc['content'] = os.path.basename(doc['content'])
        doc['date'] = datetime.datetime.fromtimestamp(doc['date']) \
            .strftime("%Y/%m/%d %H:%M")
    return Response(json.dumps(docs), mimetype='application/json')


@app.route('/api/delete/<md5sum>')
def deldocs(md5sum):
    docs = json.loads(open(DB_FILE, 'r').read())
    for index, doc in enumerate(docs):
        if md5sum == doc['md5']:
            if not doc['isText']:
                os.unlink(os.path.join(SAVING_FOLDER, doc['content']))
            del docs[index]
    open(DB_FILE, 'w').write(json.dumps(docs))
    return redirect('/')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/uploadFile', methods=['POST'])
def uploadFile():
    try:
        file = request.files['file']
        user = request.cookies['name']
        saving_path = os.path.join(SAVING_FOLDER,
                                   secure_filename(file.filename))
        file.save(saving_path)
        md5sum = getFileMd5(saving_path)
        updateDB(saving_path, md5sum, user=user)
    except:
        pass
    return redirect('/')


@app.route('/uploadText', methods=['POST'])
def uploadText():
    try:
        text = request.form['text'].strip()
        user = request.cookies['name']
        md5sum = md5.new()
        md5sum.update(text)
        updateDB(text, md5sum.hexdigest(), user=user, isText=True)
    except:
        pass
    return redirect('/')


if __name__ == '__main__':
    # create the folder to save the uploads
    app.config['DEBUG'] = True
    SAVING_FOLDER = os.path.join(os.getcwd(), "static", "uploads")
    DB_FILE = os.path.join(SAVING_FOLDER, "db.json")
    if not os.path.exists(SAVING_FOLDER):
        os.mkdir(SAVING_FOLDER)
    elif not os.path.isdir(SAVING_FOLDER):
        sys.exit("Error, \"uploads\" exists in directory but \
is not a file. Aborting")
    app.run()
