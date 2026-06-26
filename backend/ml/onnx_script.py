import model

def main():
    
    width = 500
    height = 500
    
    in_path = './files/'
    out_path = '../app/assets/ml/'
    name = 'number_model'

    
    model.prepare(name, in_path, out_path, width, height)


if __name__ == '__main__': main()