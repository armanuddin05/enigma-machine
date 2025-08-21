#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define ALPHABET_SIZE 26
#define NUM_ROTORS 8

/* Array of rotors */
const char* enigma_rotors[NUM_ROTORS+1] = {
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ", //0
    "EKMFLGDQVZNTOWYHXUSPAIBRCJ", //1
    "AJDKSIRUXBLHWTMCQGZNPYFVOE", //2
    "BDFHJLCPRTXVZNYEIWGAKMUSQO", //3
    "ESOVPZJAYQUIRHXLNFTGKDCMWB", //4
    "UKLBEPXWJVFZIYGAHCMTONDRQS", //5
    "JPGVOUMFYQBENHZRDKASXLICTW", //6
    "NZJHGRCXMYSWBOUFAIVLPEKQDT", //7
    "FKQHTLXOCBJSPDZRAMEWNIUYGV"  //8
};

/*
 * Convert a space-separated string of rotor indices into
 * an integer array of rotor indices
 *
 * @param rotor_ind_str   Space-separated string of rotor indices
 * @param num_rotors      Number of rotors provided in the string
 * @return                Integer array of rotor indices
 */
int* parse_rotor_indices(char* rotor_ind_str, int num_rotors) {
    // TODO

    int *pa = malloc(num_rotors * (sizeof(int)));
    if (pa == NULL) {
        printf("Memory allocation failed!\n");
        return NULL;
    }
  
    int j = 0;
    for (int i = 0; rotor_ind_str[i] != 0 && j < num_rotors; i++){
        if (rotor_ind_str[i] >= '1' && rotor_ind_str[i] < '9'){ 
                pa[j++] = rotor_ind_str[i] - '0';
        }     
    }    
    while (j < num_rotors){
        pa[j++] = 0;
    }   
  
    return pa;
}

/*
 * Create a 2D array of integers where
 * each row represents a rotor
 *
 * @param rotors          Integer array of rotor indices
 * @param num_rotors      Number of rotors provided
 * @return                2D array where each row represents a rotor
 */
int** set_up_rotors(int* rotors, int num_rotors) {
    // TODO
    int** arr = (int**)malloc(num_rotors * sizeof(int*));
  
      for (int i = 0; i < num_rotors; i++){
            int idx = rotors[i];
            int len = strlen(enigma_rotors[idx]);
  
            arr[i] = (int*)malloc((len+1) * sizeof(int));
            for (int j = 0; j < ALPHABET_SIZE; j++) {
                arr[i][j] = enigma_rotors[idx][j];
            }

      }
  
  
      return (int**)arr;
    
}


/*
 * Rotate each rotor to the right by the
 * given number of rotations
 *
 * @param rotor_config   2D array of rotors
 * @param rotations      Number of rotations
 * @param num_rotors     Number of rotors provided
 */
void rotate_rotors(int** rotor_config, int rotations, int num_rotors) {
    // TODO
    
    rotations %= ALPHABET_SIZE;
    
    
    int num = 0;
    int r = -1;
    for (int i = num_rotors; i != 0; i--){
  
        r++;
        for (int i = rotations; i != 0; i--){
  
  
            num = rotor_config[r][ALPHABET_SIZE-1];
            for (int j = ALPHABET_SIZE-1; j > 0; j--){
                rotor_config[r][j] = rotor_config[r][j-1];
            }
            rotor_config[r][0] = num;
  
        }
    }
}

/*
 * Encrypt the given message
 *
 * @param message        Message to encrypt
 * @param rotor_config   2D array of rotors
 * @param num_rotors     Number of rotors provided
 * @return               Encrypted message
 */
char* encrypt(char *message, int** rotor_config, int num_rotors) {
    // TODO
    for (int i = 0; message[i] != '\0'; i++){
        if (message[i] >= 97 && message[i] <= 122){
            message[i] -= 32;
        }

    }

    
    int num = 0;
    int r = -1;
    for (int i = num_rotors; i != 0; i--){
        r++;
        for (int j = 0; message[j] != 0;j++){
            if (message[j] >= 65 && message[j] <= 90){   
                num = message[j] - 65;
                message[j] = rotor_config[r][num];
            }

        }
    }
    
    return message;
}

/*
 * Decrypt the given message
 *
 * @param message        Message to decrypt
 * @param rotor_config   2D array of rotors
 * @param num_rotors     Number of rotors provided
 * @return               Decrypted message
 */

// my helper function to reverse order of 2d arr


char* decrypt(char *message, int** rotor_config, int num_rotors) {
    // TODO
    for (int i = 0; message[i] != '\0'; i++){
        if (message[i] >= 97 && message[i] <= 122){
            message[i] -= 32;
        }

    }




    int num = 0;
    int r = num_rotors;
    for (int i = num_rotors; i != 0; i--){
        r--;

        for (int j = 0; message[j] != 0;j++){
            if (message[j] >= 65 && message[j] <= 90){   

                for (int x = 0; x < ALPHABET_SIZE; x++) {
                    if (rotor_config[r][x] == message[j]) {
                        message[j] = x + 65; 
                        break;
                    }
                }
                //num = message[j] - 65;
                //message[j] = rotor_config[r][num];
            }

        }
    }
    return message;
    
}

/*
 * Format of command line input:
 * ./enigma e "JAVA" 3 "1 2 4" 0
 * 
 *    e    - mode (e for encrypt, d for decrypt)
 * "JAVA"  - message
 *    3    - number of rotors to use
 * "1 2 4" - indices of rotors to use
 *    0    - number of rotations of the rotors
 */
int main(int argc, char* argv[]) {
    // TODO
    if (argc != 6) {
        return 1;
    }

    char *type = argv[1];  
    char* message = argv[2];
    int num_rotors = atoi(argv[3]);
    char* indices1 = argv[4];
    int rotations = atoi(argv[5]);

    int* rotor_indices = parse_rotor_indices(indices1, num_rotors);

    int** rotor_config = set_up_rotors(rotor_indices, num_rotors);
    rotate_rotors(rotor_config, rotations, num_rotors);

    char* result;
    if (type[0] == 'e') {
        result = encrypt(message, rotor_config, num_rotors);
        printf("Encrypted message: %s\n", result);
    } 
    else {
        result = decrypt(message, rotor_config, num_rotors);
        printf("Decrypted message: %s\n", result);
    }

    for (int i = 0; i < num_rotors; i++) {
        free(rotor_config[i]);
    }
    free(rotor_config);
    free(rotor_indices);
    return 0;
}
