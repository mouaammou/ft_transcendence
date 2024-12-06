FROM python:3.12

WORKDIR /backend

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/backend

# First run init script, then start Django server
CMD sh -c "python3 tools/init.py"