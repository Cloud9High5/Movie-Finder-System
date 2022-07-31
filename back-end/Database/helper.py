# from sqlite3 import connect
# from sqlalchemy import insert


# def data_transfer():
    
#     table_dict = {
#         "followers": followers,
#         "users_wish_film": users_wish_film,
#         "blocked_users" : blocked_users,
#     }
    
#     conn = connect(app.root_path + '/Database/doubi_database_old.db')
#     c = conn.cursor()
    
#     # get all table name
#     c.execute('SELECT name FROM sqlite_master WHERE type="table"')
#     tables = c.fetchall()
#     for table in tables:
#         table = table[0]
#         print("----- processing table: <%s> -----" % table)
        
#         c.execute('SELECT * FROM %s' % table)
#         data_old = c.fetchall()
        
#         c.execute('PRAGMA table_info(%s)' % table)
#         attributes = c.fetchall()
        
#         attributes = [attribute[1] for attribute in attributes]
#         data = []
#         if table == 'user':
#             continue
#             attributes[2] = 'password'
            
#             for index, item in enumerate(data_old):
#                 print("%s(%d/%d)" % (item[1], index+1, len(data_old)))
#                 item = list(item)
#                 item[2] = item[1][0] + '_DOUBI123'
#                 item[7] = datetime.strptime(item[7], '%Y-%m-%d %H:%M:%S.%f')
#                 item[8] = datetime.strptime(item[8], '%Y-%m-%d %H:%M:%S.%f')
                
#                 db.session.add(User(
#                     u_id=item[0],
#                     username=item[1],
#                     password=item[2],
#                     email=item[3],
#                     url_photo=item[4],
#                     is_admin=item[5],
#                     is_blocked=item[6],
#                     created_time=item[7],
#                     updated_time=item[8]
#                 ))
#             db.session.commit()
#             print("----- <user> done -----")
#         elif table == 'film':
#             continue
#             data = []
#             for index, item in enumerate(data_old):
#                 print("%s(%d/%d)" % (item[1], index+1, len(data_old)))
#                 item = list(item)
#                 item[attributes.index('created_time')] = datetime.strptime(item[attributes.index('created_time')], '%Y-%m-%d %H:%M:%S.%f')
#                 item[attributes.index('updated_time')] = datetime.strptime(item[attributes.index('updated_time')], '%Y-%m-%d %H:%M:%S.%f')
                
#                 data.append(dict(zip(attributes, item)))
                
#             db.session.bulk_insert_mappings(Film, data)
#             db.session.commit()
#             print("----- <%s> done -----" % table)
#         elif table == 'review':
#             continue
#             data = []
#             for inde, item in enumerate(data_old):
#                 print("%s(%d/%d)" % (table, inde+1, len(data_old)))
#                 item = list(item)
#                 item[attributes.index('created_time')] = datetime.strptime(item[attributes.index('created_time')], '%Y-%m-%d %H:%M:%S.%f')
#                 item[attributes.index('updated_time')] = datetime.utcnow()
                
#                 data.append(dict(zip(attributes, item)))
            
#             db.session.bulk_insert_mappings(Review, data)
#             db.session.commit()
#             print("----- <%s> done -----" % table)
#         elif table in ["review_like", "review_dislike"]:
#             # continue
#             data = []
#             for index, item in enumerate(data_old):
#                 print("%s(%d/%d)" % (table, index+1, len(data_old)))
#                 item = list(item)
#                 item[attributes.index('created_time')] = datetime.strptime(item[attributes.index('created_time')], '%Y-%m-%d %H:%M:%S.%f')
                
#                 data.append(dict(zip(attributes, item)))
            
#             if table == "review_like":
#                 db.session.bulk_insert_mappings(Review_Like, data)
#             else:
#                 db.session.bulk_insert_mappings(Review_Dislike, data)
#             db.session.commit()
#             print("----- <%s> done -----" % table)
#         else:
#             continue
#             data = []
#             # insert data to table named <table>
#             for index, item in enumerate(data_old):
#                 print("%s(%d/%d)" % (table, index+1, len(data_old)))
#                 item = list(item)
#                 data.append(dict(zip(attributes, item)))
                
#                 db.session.execute(insert(table_dict[table]).values(item))
                
#             db.session.commit()
#             print("----- <%s> done -----" % table)
