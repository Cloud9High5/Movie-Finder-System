from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from Models.model import Film, Review

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
    top_5_indices = list(score_series.iloc[1:6].index)
    
    for i in top_5_indices:
        result.append(list(film_df['f_id'])[i])
    
    return result
    
def user_based_recommendation(u_id):
    
    # Collect all users
    reviews = Review.query.all()
    reviews = [[
        review.f_id,
        review.u_id,
        review.rating,
    ] for review in reviews]

    # convert to dataframe
    review_df = pd.DataFrame(reviews, columns=['f_id', 'u_id', 'rating'])
    
    # create the user-film matrix
    rating_matrix = review_df.pivot_table(index='u_id', columns='f_id', values='rating')
    
    # calculate the similarity between users
    user_similarity = rating_matrix.T.corr()
    
    results = predict_all(u_id, rating_matrix, user_similarity)
    return sorted(results, key=lambda x: x[2], reverse=True)[:5]
    

def predict(uid, iid, ratings_matrix, user_similar):
    
    # find similar user to targe user
    similar_users = user_similar[uid].drop([uid]).dropna()
    
    # select only positive ratings
    similar_users = similar_users.where(similar_users>0).dropna()
    if similar_users.empty is True:
        return False

    # from the similar users of the target user, select the users who have rated the film
    ids = set(ratings_matrix[iid].dropna().index)&set(similar_users.index)
    finally_similar_users = similar_users.loc[list(ids)]

    # using the similarity between users to predict the rating
    numerator = 0
    denominator = 0
    for sim_uid, similarity in finally_similar_users.iteritems():
        sim_user_rated_movies = ratings_matrix.loc[sim_uid].dropna()
        sim_user_rating_for_item = sim_user_rated_movies[iid]
        numerator += similarity * sim_user_rating_for_item
        denominator += similarity
    if denominator == 0:
        return False
    predict_rating = numerator/denominator
    return round(predict_rating, 2)


def predict_all(uid, ratings_matrix, user_similar):
    item_ids = ratings_matrix.columns
    
    for iid in item_ids:
        try:
            rating = predict(uid, iid, ratings_matrix, user_similar)
        except Exception as e:
            print(e)
        else:
            yield uid, iid, rating
