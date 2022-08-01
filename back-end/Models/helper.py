from uuid import uuid1, uuid3

def u_id_generator(context):
    return str(uuid3(uuid1(), context.get_current_parameters()['email']).hex)


def f_id_generator(context):
    return str(uuid3(uuid1(), context.get_current_parameters()['title']).hex)


def r_id_generator(context):
    return str(uuid3(uuid1(), context.get_current_parameters()['f_id']).hex)