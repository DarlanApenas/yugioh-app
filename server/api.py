import random
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Habilitar CORS

@app.route('/random-gif', methods=['GET'])
def random_gif():
    gif_number = random.randint(2, 83)
    gif_number_formatted = f"{gif_number:02d}"
    gif_url = f"https://gif.plaza.one/{gif_number_formatted}.gif"
    
    return jsonify({'gif_url': gif_url})

if __name__ == '__main__':
    app.run(debug=True)
