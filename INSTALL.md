 ## Installation:

### Requirements:

- [Python](https://www.python.org/downloads/) (recommended >= 3.8)
- [pip](https://pip.pypa.io/en/stable/installation/) (Latest version 21.3 used as of 11/3)
- [npm](https://nodejs.org/en/) (Latest version 6.14.4 used as of 11/3)
- [Docker-Desktop](https://www.docker.com/products/docker-desktop/) (Latest version as of 11/27)

### Steps to follow for the installation:

1. **Clone the Repository**
    - Use the command `git clone https://github.com/Group21-SWE/Project2.git` to clone the repository.

2. **Start the Docker Engine**
    - Ensure that Docker is installed on your system. If not, you can download it from the official Docker website.
    - Start the Docker engine on your machine. The command varies based on your operating system.

3. **Build Images**
    - Navigate to the backend folder and build the image for the API using the following command:
        ```
        docker build -f dockerfile.api -t ats-api .
        ```
    - Similarly, navigate to the frontend folder and build the image for the client using the following command:
        ```
        docker build -f dockerfile.client -t ats-client .
        ```
4. **Generate Gemini API Key**
    - You'll need to get an API key from https://makersuite.google.com/app/apikey
    - This project uses the model gemini-2.0-flash, which is currently free.

5. **Run Docker Compose**
    - Finally, run the following command to start the application:
        ```
        GEMINI_API_KEY=<your-key> docker-compose up —watch
        ```

6. **Navigate to**
    ```
    http://localhost:3000/?
    ```
