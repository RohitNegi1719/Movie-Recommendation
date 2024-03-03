from flask import Flask, render_template, request, jsonify
import pandas as pd
import joblib
import gzip

app = Flask(__name__)

# Paths to data and compressed model
data_path = 'freduced2.csv'
model_path = 'compressed_model.pkl.gz'

# Load data
data = pd.read_csv(data_path)
data['Title'] = data['Title'].str.lower()

# Load model at the start of the application
with gzip.open(model_path, 'rb') as f:
    cosine_sim = joblib.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/suggestions', methods=['POST'])
def get_suggestions():
    partial_title = request.json['partial_title'].lower()
    suggestions = data[data['Title'].str.contains(partial_title, case=False)]['Title'].tolist()
    return jsonify({'suggestions': suggestions})

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    movie_title = request.json['movie_title'].lower()
    if movie_title not in data['Title'].values:
        return jsonify({'message': 'Sorry! We do not have this movie in our database yet or check the spelling'})
    
    idx = data[data['Title'] == movie_title].index[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:11]
    movie_indices = [i[0] for i in sim_scores]
    recommendations = data.iloc[movie_indices][['Title', 'Poster_Link', 'Plot_Story']]
    return jsonify(recommendations.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)
