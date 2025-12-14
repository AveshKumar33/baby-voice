# Use Python 3.12 slim for lightweight image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install watchgod

# Copy the rest of the code
COPY . .

# Expose port if needed
EXPOSE 5000

# Run Python with watchgod for hot reload
CMD ["watchgod", "main.py"]
