FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./

# Add a longer timeout
RUN pip install --no-cache-dir -r requirements.txt --timeout 120 --retries 10

COPY . .
CMD ["python", "main.py"]
