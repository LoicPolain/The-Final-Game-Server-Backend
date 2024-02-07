# Use the official Ubuntu image as the base image
FROM ubuntu:latest

# Set the working directory in the container
WORKDIR /app

# Copy the local script into the container at /app
COPY ./LinuxArm64Server /app/

# Expose port 7777/UDP
EXPOSE 7777/udp

# Make the script executable
#RUN chmod +x FinalGameServer.sh

# Run the script
CMD ["./FinalGameServer-Arm64.sh"]