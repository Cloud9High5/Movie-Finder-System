from numpy import indices
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import column
from Models.model import Film

import pandas as pd
import re

ENGLISH_STOP_WORDS = set([
    'a', 'about', 'above', 'across', 'after', 'afterwards',
    'again', 'against', 'ain', 'all', 'almost', 'alone', 'along',
    'already', 'also', 'although', 'always', 'am', 'among', 'amongst',
    'amoungst', 'amount', 'an', 'and', 'another', 'any', 'anyhow',
    'anyone', 'anything', 'anyway', 'anywhere', 'are', 'aren',
    'around', 'as', 'at', 'back', 'be', 'became', 'because',
    'become', 'becomes', 'becoming', 'been', 'before', 'beforehand',
    'behind', 'being', 'below', 'beside', 'besides', 'between', 'beyond',
    'bill', 'both', 'bottom', 'but', 'by', 'call', 'can', 'cannot',
    'cant', 'co', 'con', 'could', 'couldn', 'couldnt', 'cry', 'd',
    'de', 'describe', 'detail', 'did', 'didn', 'do', 'does',
    'doesn', 'doing', 'don', 'done', 'down', 'due', 'during',
    'each', 'eg', 'eight', 'either', 'eleven', 'else', 'elsewhere',
    'empty', 'enough', 'etc', 'even', 'ever', 'every', 'everyone',
    'everything', 'everywhere', 'except', 'few', 'fifteen', 'fify',
    'fill', 'find', 'fire', 'first', 'five', 'for', 'former',
    'formerly', 'forty', 'found', 'four', 'from', 'front', 'full',
    'further', 'get', 'give', 'go', 'had', 'hadn', 'has', 'hasn',
    'hasnt', 'have', 'haven', 'having', 'he', 'hence', 'her', 'here',
    'hereafter', 'hereby', 'herein', 'hereupon', 'hers', 'herself',
    'him', 'himself', 'his', 'how', 'however', 'hundred', 'i', 'ie',
    'if', 'in', 'inc', 'indeed', 'interest', 'into', 'is', 'isn', 'it',
    'its', 'itself', 'just', 'keep', 'last', 'latter', 'latterly', 'least',
    'less', 'll', 'ltd', 'm', 'ma', 'made', 'many', 'may', 'me',
    'meanwhile', 'might', 'mightn', 'mill', 'mine', 'more', 'moreover',
    'most', 'mostly', 'move', 'much', 'must', 'mustn', 'my', 'myself',
    'name', 'namely', 'needn', 'neither', 'never', 'nevertheless', 'next',
    'nine', 'no', 'nobody', 'none', 'noone', 'nor', 'not', 'nothing',
    'now', 'nowhere', 'o', 'of', 'off', 'often', 'on', 'once', 'one',
    'only', 'onto', 'or', 'other', 'others', 'otherwise', 'our', 'ours',
    'ourselves', 'out', 'over', 'own', 'part', 'per', 'perhaps', 'please',
    'put', 'rather', 're', 's', 'same', 'see', 'seem', 'seemed', 'seeming',
    'seems', 'serious', 'several', 'shan', 'she', 'should', 'shouldn',
    'show', 'side', 'since', 'sincere', 'six', 'sixty', 'so', 'some',
    'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhere', 
    'still', 'such', 'system', 't', 'take', 'ten', 'than', 'that', 'the',
    'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there',
    'thereafter', 'thereby', 'therefore', 'therein', 'thereupon', 'these',
    'they', 'thick', 'thin', 'third', 'this', 'those', 'though', 'three',
    'through', 'throughout', 'thru', 'thus', 'to', 'together', 'too', 'top',
    'toward', 'towards', 'twelve', 'twenty', 'two', 'un', 'under', 'until', 
    'up', 'upon', 'us', 've', 'very', 'via', 'was', 'wasn', 'we', 'well',
    'were', 'weren', 'what', 'whatever', 'when', 'whence', 'whenever',
    'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'whereupon', 
    'wherever', 'whether', 'which', 'while', 'whither', 'who', 'whoever',
    'whole', 'whom', 'whose', 'why', 'will', 'with', 'within', 'without',
    'won', 'would', 'wouldn', 'y', 'yet', 'you', 'your', 'yours',
    'yourself', 'yourselves'
])


def film_based_recommendation(f_id):
    """recommendation film based on the film similarity

    Args:
        f_id (str): f_id for a film in db

    Returns:
        list: a list of 10 f_id for recommended films
    """
    
    # Collect all films
    films = Film.query.all()
    films_list = [[
        film.f_id,
        film.title,
        film.genre,
        film.director,
        film.actor,
        film.overview,
    ] for film in films]
    film_df = pd.DataFrame(films_list, columns=['f_id', 'title', 'genre', 'director', 'actor', 'overview'])
    
    # preprocess the data
    film_df['kwd'] = ''
    
    for index, row in film_df.iterrows():
        
        # overview
        overview = row['overview']
        # remove punctuation
        overview = re.sub(r'[^\w\s]', '', overview)
        # convert to lowercase
        overview = overview.lower()
        # remove stop words
        overview = [word for word in overview.split() if word not in ENGLISH_STOP_WORDS]
        
        row['kwd'] = overview
        
        # title
        title = row['title']
        # convert to lowercase
        title = title.lower()
        # remove stop words
        title = [word for word in title.split() if word not in ENGLISH_STOP_WORDS]
        
        row['title'] = title
    
    # extract value from string for genre, actor and director
    film_df['genre'] = film_df['genre'].map(lambda x: x.split(','))
    film_df['actor'] = film_df['actor'].map(lambda x: x.split(','))
    film_df['director'] = film_df['director'].map(lambda x: x.split(','))
    # remove spaces
    for index, row in film_df.iterrows():
        row['genre'] = [x.lower().replace(' ','') for x in row['genre']]
        row['actor'] = [x.lower().replace(' ','') for x in row['actor']]
        row['director'] = [x.lower().replace(' ','') for x in row['director']]
        
    # collect all keywords
    film_df['bag_of_words'] = ''
    columns = ['kwd', 'title', 'genre', 'actor', 'director']
    for index, row in film_df.iterrows():
        bag_of_words = ''
        for column in columns:
            bag_of_words += ' '.join(row[column]) + ' '
        row['bag_of_words'] = bag_of_words
    
    film_df = film_df[['f_id', 'bag_of_words']]
    
    # calculate the similarity between films
    count = CountVectorizer()
    count_matrix = count.fit_transform(film_df['bag_of_words'])
    sim = cosine_similarity(count_matrix, count_matrix)
    
    # save indices of the films
    indices = pd.Series(film_df['f_id'])
    
    # recommend films
    result = []
    idx = indices[indices == f_id].index[0]
    score_series = pd.Series(sim[idx]).sort_values(ascending = False)
    top_10_indices = list(score_series.iloc[1:11].index)
    
    for i in top_10_indices:
        result.append(list(film_df['f_id'])[i])
    
    return result
    
# def film_based_recommendation(f_id):