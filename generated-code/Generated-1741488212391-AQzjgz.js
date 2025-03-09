def error_reporter(log_file):
    errors = {}
    with open(log_file, 'r') as file:
        for line in file:
            if 'Error' in line:
                error_type = line.split(':')[0].strip()
                error_message = line.split(':')[1].strip()
                if error_type in errors:
                    errors[error_type].append(error_message)
                else:
                    errors[error_type] = [error_message]
    report = "Error Report:\n"
    for error_type, messages in errors.items():
        report += f"{error_type}:\n"
        for message in messages:
            report += f"- {message}\n"
    return report

log_file = 'error_log.txt'
print(error_reporter(log_file))
