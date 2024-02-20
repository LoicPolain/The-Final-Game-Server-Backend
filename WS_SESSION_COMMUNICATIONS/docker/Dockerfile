# Use the official Ubuntu image as the base image
FROM ubuntu:latest

# Set the working directory in the container
WORKDIR /app

# Copy the local script into the container at /app
COPY ./LinuxServer /app/

# Expose port 7777/UDP
EXPOSE 7777/udp


# Add a user 'appuser' with UID 1000 and GID 1000
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g appgroup -d /app appuser

# Change the ownership of the files to the newly created user
RUN chown -R appuser:appgroup /app

# Make the script executable
RUN chmod +x FinalGameServer.sh

# Switch to the newly created user
USER appuser

# Run the script
CMD ["./FinalGameServer.sh", "-server", "-log", "-epicapp=Dedicated_Server_Artifact"]
