from flask import Flask, render_template, request
import io
import contextlib
import sys

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('ide.html')

@app.route('/run', methods=['POST'])
def run_code():
    code = request.form['code']
    with io.StringIO() as buf, contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
        try:
            exec(code)
            output = buf.getvalue()
        except Exception as e:
            output = str(e)
    return output

if __name__ == '__main__':
    app.run(debug=True)
