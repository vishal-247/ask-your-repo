# how to run this project!!

## step 0   
- clone the repository to your local machine using the following command:

```bash 
git clone <repository-url>
```
create a virtual environment and activate it by running the following commands in the terminal:

```bash 
python -m venv env
source env/bin/activate  # On Windows, use `env\Scripts\activate`
``` 

## step 1

-install all the dependencies by running the following command in the terminal:

```bash
pip install -r requirements.txt
```

## step 2
-create a .env file in the root directory of the project and add the following environment variables:

```bash
GITHUB_TOKEN=your_github_token
NVIDIA_API_KEY=your_nvidia_api_key
```
## step 3

-run the following command to start the FastAPI server:

```bash
uvicorn backend.main:app --reload --port 8000
```
## step 4   
- start the forntend by running the following command in the terminal:

```bash 
cd frontend
python -m http.server 5500
# then open http://127.0.0.1:5500 in your web browser
```